#!/usr/bin/env python3
"""
NSBE UM Careers pipeline — runs weekly via .github/workflows/update-jobs.yml.

Pulls engineering internship / new-grad listings from:
  1. SimplifyJobs listing JSONs (community-maintained, structured) — URLs in
     jobs-config.json, update the repo year in "sources" each recruiting cycle.
  2. Any "extra_sources" in jobs-config.json using the same listings format
     (community forks; duplicates are dropped by URL).
  3. Public ATS APIs for every company in data/companies.json that declares
     an "ats" slug: Greenhouse ("greenhouse:SLUG"), Lever ("lever:SLUG"),
     or Workday ("workday:HOST/TENANT/SITE"). Workday is what most large
     ME/EE/Civil/ChemE/Aero/BME employers use, so those slugs are what give
     non-software disciplines real coverage.

Classifies every role into engineering disciplines (CS, ME, EE, Aero, ...)
using the keyword taxonomy in jobs-config.json, tags freshman-friendly
programs and co-ops, then writes:
  - data/jobs.json        (what careers.html renders)
  - data/companies.json   (open-role counts refreshed in place; all
                           board-curated fields are preserved)

Stdlib only — no pip installs. Safe to re-run; failures in one source never
wipe data from another.
"""

import json
import os
import re
import sys
import time
import urllib.request
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG_PATH = os.path.join(ROOT, "jobs-config.json")
COMPANIES_PATH = os.path.join(ROOT, "data", "companies.json")
JOBS_PATH = os.path.join(ROOT, "data", "jobs.json")

# Offline test mode: read {name}.json fixture files instead of the network.
FIXTURES = os.environ.get("JOBS_FIXTURES", "")

UA = {"User-Agent": "nsbe-um-battle-pass-careers/1.0 (github.com/JaleelADA/nsbe-uofm-battle-pass)"}


def fetch_json(url, fixture_name, post_body=None):
    if FIXTURES:
        path = os.path.join(FIXTURES, fixture_name + ".json")
        if not os.path.exists(path):
            raise RuntimeError("fixture missing: " + path)
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    headers = dict(UA)
    data = None
    if post_body is not None:
        headers["Content-Type"] = "application/json"
        headers["Accept"] = "application/json"
        data = json.dumps(post_body).encode("utf-8")
    req = urllib.request.Request(url, headers=headers, data=data)
    with urllib.request.urlopen(req, timeout=45) as resp:
        return json.loads(resp.read().decode("utf-8"))


# ---------------------------------------------------------------- classify --

def build_matchers(config):
    matchers = []  # (discipline, category, compiled_regex)
    for disc, cats in config["taxonomy"].items():
        for cat, kws in cats.items():
            for kw in kws:
                matchers.append((disc, cat, re.compile(r"\b" + re.escape(kw))))
    # Compiled once and cached on the config so classify() keeps its signature.
    config["_exclusions"] = {
        disc: [re.compile(r"\b" + re.escape(k)) for k in kws]
        for disc, kws in (config.get("taxonomy_exclusions") or {}).items()
    }
    return matchers


def classify(title, simplify_category, matchers, config):
    """Returns (disciplines, categories) for a job title.

    A discipline keyword can fire on an unrelated title ("Civil Liberties
    Software Engineer" is not civil engineering), so each discipline may list
    veto phrases under taxonomy_exclusions in jobs-config.json. A vetoed
    discipline drops out along with its categories; other matches survive, so
    that example still classifies as CS.
    """
    t = " " + title.lower() + " "
    exclusions = config.get("_exclusions") or {}
    pairs = []
    for disc, cat, rx in matchers:
        if rx.search(t) and (disc, cat) not in pairs:
            pairs.append((disc, cat))
    pairs = [(d, c) for (d, c) in pairs
             if not any(ex.search(t) for ex in exclusions.get(d, []))]

    discs, cats = [], []
    for d, c in pairs:
        if d not in discs:
            discs.append(d)
        if c not in cats:
            cats.append(c)
    if not discs and simplify_category:
        fb = config["category_fallback"].get(simplify_category)
        if fb:
            discs, cats = [fb[0]], [fb[1]]
    if not discs:
        discs, cats = ["Other"], ["General"]
    return discs[:3], cats[:3]


def is_freshman_friendly(title, config):
    t = title.lower()
    return any(kw in t for kw in config["freshman_keywords"])


def is_coop(title):
    return bool(re.search(r"\bco[- ]?op\b", title.lower()))


# ------------------------------------------------------------------ sources --

def slim(company, title, url, locations, level, discs, cats, posted, sponsorship, source, config):
    return {
        "company": company,
        "title": title,
        "url": url,
        "locs": [str(l) for l in (locations or [])][:3],
        "level": level,
        "disc": discs,
        "cat": cats,
        "fresh": is_freshman_friendly(title, config),
        "coop": is_coop(title),
        "posted": posted,
        "spons": sponsorship or "",
        "src": source,
    }


def pull_simplify(url, level, matchers, config, fixture_name, source="simplify"):
    """SimplifyJobs listings.json format — also used by community forks
    (vanshb03 etc.) whose rows carry `season` instead of `terms`/`category`."""
    jobs = []
    data = fetch_json(url, fixture_name)
    if not isinstance(data, list):
        raise RuntimeError("unexpected Simplify payload shape")
    for x in data:
        try:
            if not x.get("active") or not x.get("is_visible", True):
                continue
            title = str(x.get("title", "")).strip()
            company = str(x.get("company_name", "")).strip()
            job_url = str(x.get("url", "")).strip()
            if not title or not company or not job_url:
                continue
            discs, cats = classify(title, x.get("category"), matchers, config)
            posted = ""
            ts = x.get("date_posted") or x.get("date_updated")
            if isinstance(ts, (int, float)) and ts > 0:
                posted = datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%Y-%m-%d")
            j = slim(company, title, job_url, x.get("locations"), level,
                     discs, cats, posted, x.get("sponsorship"), source, config)
            # Off-cycle detection: Simplify carries a `terms` array, forks carry
            # a `season` string. Fall/Winter/Spring roles are what co-op
            # students search for, so they share the co-op flag.
            terms = x.get("terms") or ([x["season"]] if x.get("season") else [])
            if any(t and "summer" not in str(t).lower() for t in terms):
                j["coop"] = True
            jobs.append(j)
        except Exception:
            continue  # one malformed row never kills the run
    return jobs


# Word-boundary on both sides: "Intern"/"Internship(s)" yes, "Internal"/"International" no.
ROLE_RX = re.compile(r"\binterns?(?:ship)?\b|\bco[- ]?op\b|new grad|university grad|entry level|early career|campus hire|graduate engineer|rotational", re.I)

# A title has to read as technical before we'll assume an employer's recruited
# majors apply to it.
ENG_HINT_RX = re.compile(
    r"\bengineer|\bengineering\b|\btechnical\b|\btechnolog|\br&d\b|\bdesign\b|"
    r"\bmanufactur|\bquality\b|\bscien|\bdevelop|\bautomation\b|\breliability\b|"
    r"\bprocess\b|\bproduct development\b|\bhardware\b|\bsoftware\b|\blab\b|"
    r"\btechnician\b|\bmaintenance\b|\bsupply chain\b|\boperations\b", re.I)


def is_non_engineering(title, config):
    """True for roles an engineering careers site shouldn't file under a major."""
    t = " " + title.lower() + " "
    for kw in (config.get("non_engineering_titles") or []):
        if re.search(r"\b" + re.escape(kw.lower()), t):
            return True
    return False
NEWGRAD_RX = re.compile(r"new grad|entry|early career|graduate|rotational", re.I)
INTERN_RX = re.compile(r"\binterns?(?:ship)?\b|\bco[- ]?op\b", re.I)


def infer_level(title):
    return "newgrad" if NEWGRAD_RX.search(title) and not INTERN_RX.search(title) else "intern"


def pull_ats(company_entry, matchers, config):
    """Greenhouse/Lever/Workday public feeds -> student-relevant roles + open count."""
    ats = company_entry.get("ats", "")
    name = company_entry.get("name", "?")
    kind, _, slug = ats.partition(":")
    jobs = []
    if kind == "greenhouse":
        data = fetch_json("https://boards-api.greenhouse.io/v1/boards/%s/jobs" % slug, "gh-" + slug)
        postings = data.get("jobs", [])
        for p in postings:
            title = str(p.get("title", ""))
            if not ROLE_RX.search(title):
                continue
            discs, cats = classify(title, None, matchers, config)
            posted = str(p.get("updated_at", ""))[:10]
            loc = (p.get("location") or {}).get("name", "")
            jobs.append(slim(name, title, p.get("absolute_url", ""), [loc] if loc else [],
                             infer_level(title), discs, cats, posted, "", "greenhouse", config))
    elif kind == "lever":
        postings = fetch_json("https://api.lever.co/v0/postings/%s?mode=json" % slug, "lever-" + slug)
        for p in postings:
            title = str(p.get("text", ""))
            if not ROLE_RX.search(title):
                continue
            discs, cats = classify(title, None, matchers, config)
            posted = ""
            if isinstance(p.get("createdAt"), (int, float)):
                posted = datetime.fromtimestamp(p["createdAt"] / 1000, tz=timezone.utc).strftime("%Y-%m-%d")
            loc = ((p.get("categories") or {}).get("location")) or ""
            jobs.append(slim(name, title, p.get("hostedUrl", ""), [loc] if loc else [],
                             infer_level(title), discs, cats, posted, "", "lever", config))
    elif kind == "ashby":
        # Common among the reactor/robotics startups, which is where a lot of
        # the Nuclear and Robotics openings live.
        data = fetch_json("https://api.ashbyhq.com/posting-api/job-board/%s" % slug, "ashby-" + slug)
        for p in (data or {}).get("jobs", []) or []:
            title = str(p.get("title", ""))
            if not ROLE_RX.search(title):
                continue
            discs, cats = classify(title, None, matchers, config)
            loc = str(p.get("location", "") or "")
            jobs.append(slim(name, title, p.get("jobUrl", ""), [loc] if loc else [],
                             infer_level(title), discs, cats,
                             str(p.get("publishedAt", ""))[:10], "", "ashby", config))
    elif kind == "workday":
        jobs = pull_workday(name, slug, matchers, config)
    else:
        raise RuntimeError("unknown ats kind: " + ats)
    # Employer feeds list every internship, not just engineering ones. Drop the
    # clearly non-technical roles (Finance, HR, Customs, Communications…) unless
    # a discipline keyword actually matched the title — otherwise an HR co-op at
    # a medical-device company ends up filed under Biomedical Engineering.
    jobs = [j for j in jobs
            if j["disc"] != ["Other"] or not is_non_engineering(j["title"], config)]

    # Generic engineering titles ("R&D Engineer Intern") carry no discipline
    # keywords — fall back to the majors the board says this company recruits.
    # Gated on the title reading as technical, for the same reason as above.
    majors = [m for m in company_entry.get("majors", []) if m in config["disciplines"] and m != "Other"]
    if majors:
        for j in jobs:
            if j["disc"] == ["Other"] and ENG_HINT_RX.search(j["title"]):
                j["disc"] = majors[:3]
    return jobs


# Workday's shared facet id for United States (same GUID across tenants).
WD_US_FACET = "bc33aa3152ec42d4995f4791a106ed09"
WD_POSTED_RX = re.compile(r"(\d+)\+?\s+day", re.I)


def wd_posted_date(posted_on):
    """'Posted Today' / 'Posted Yesterday' / 'Posted 12 Days Ago' / 'Posted 30+ Days Ago'
    -> approximate ISO date ('' if unparseable)."""
    t = (posted_on or "").lower()
    days = None
    if "today" in t:
        days = 0
    elif "yesterday" in t:
        days = 1
    else:
        m = WD_POSTED_RX.search(t)
        if m:
            days = int(m.group(1))
    if days is None:
        return ""
    ts = datetime.now(timezone.utc).timestamp() - days * 86400
    return datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%Y-%m-%d")


def pull_workday(name, slug, matchers, config):
    """Workday CXS feed. slug format: HOST/TENANT/SITE, e.g.
    'cat.wd5.myworkdayjobs.com/cat/CaterpillarCareers'. This is the same public
    JSON endpoint each company's own career site calls — most large ME/EE/
    Civil/ChemE/Aero/BME employers run Workday, so these feeds are what give
    non-software disciplines real coverage."""
    parts = slug.split("/")
    if len(parts) != 3:
        raise RuntimeError("workday slug must be HOST/TENANT/SITE: " + slug)
    host, tenant, site = parts
    wd_cfg = config.get("workday", {})
    terms = wd_cfg.get("terms", ["intern", "co-op", "new grad"])
    pages = int(wd_cfg.get("pages_per_term", 3))
    url = "https://%s/wday/cxs/%s/%s/jobs" % (host, tenant, site)
    base = "https://%s/en-US/%s" % (host, site)

    jobs, seen_paths = [], set()
    us_facet = {"locationCountry": [WD_US_FACET]} if wd_cfg.get("us_only", True) else {}
    for term in terms:
        for page in range(pages):
            body = {"appliedFacets": us_facet, "limit": 20, "offset": page * 20, "searchText": term}
            fixture = "wd-%s-%s-%d" % (tenant, term.replace(" ", ""), page)
            try:
                data = fetch_json(url, fixture, post_body=body)
            except Exception:
                if us_facet and page == 0:
                    # Some tenants reject the country facet (HTTP 400) — retry unfiltered.
                    us_facet = {}
                    data = fetch_json(url, fixture, post_body={"appliedFacets": {}, "limit": 20,
                                                               "offset": page * 20, "searchText": term})
                else:
                    raise
            postings = data.get("jobPostings", []) or []
            for p in postings:
                title = str(p.get("title", "")).strip()
                path = str(p.get("externalPath", ""))
                if not title or not path or path in seen_paths:
                    continue
                seen_paths.add(path)
                if not ROLE_RX.search(title):
                    continue
                discs, cats = classify(title, None, matchers, config)
                loc = str(p.get("locationsText", "") or "")
                jobs.append(slim(name, title, base + path, [loc] if loc else [],
                                 infer_level(title), discs, cats,
                                 wd_posted_date(p.get("postedOn", "")), "", "workday", config))
            if len(postings) < 20:
                break
            time.sleep(0.3)
    return jobs


# --------------------------------------------------------------------- main --

def main():
    with open(CONFIG_PATH, encoding="utf-8") as f:
        config = json.load(f)
    matchers = build_matchers(config)
    report = {"sources_ok": [], "sources_failed": []}
    all_jobs = []

    def norm(url):
        # Forked trackers list the same posting with differing query strings.
        return url.split("?")[0].rstrip("/").lower()

    for key, level, fixture in (("simplify_internships", "intern", "simplify-intern"),
                                ("simplify_newgrad", "newgrad", "simplify-newgrad")):
        url = config["sources"].get(key)
        if not url:
            continue
        try:
            jobs = pull_simplify(url, level, matchers, config, fixture)
            all_jobs.extend(jobs)
            report["sources_ok"].append("%s (%d)" % (key, len(jobs)))
        except Exception as e:
            report["sources_failed"].append("%s: %s" % (key, e))

    seen_urls = {norm(j["url"]) for j in all_jobs}
    seen_keys = {(j["company"].lower(), j["title"].lower()) for j in all_jobs}

    # Community forks in the same listings format (jobs-config "extra_sources").
    for src in config.get("extra_sources", []):
        try:
            jobs = pull_simplify(src["url"], src.get("level", "intern"), matchers, config,
                                 "extra-" + src["name"], source=src["name"])
            added = 0
            for j in jobs:
                key = (j["company"].lower(), j["title"].lower())
                if norm(j["url"]) in seen_urls or key in seen_keys:
                    continue
                seen_urls.add(norm(j["url"]))
                seen_keys.add(key)
                all_jobs.append(j)
                added += 1
            report["sources_ok"].append("%s (%d listed, %d new)" % (src["name"], len(jobs), added))
        except Exception as e:
            report["sources_failed"].append("%s: %s" % (src["name"], e))

    # ATS enrichment for the curated employer database.
    companies_doc = {"companies": [], "events": []}
    if os.path.exists(COMPANIES_PATH):
        with open(COMPANIES_PATH, encoding="utf-8") as f:
            companies_doc = json.load(f)

    for c in companies_doc.get("companies", []):
        if not c.get("ats"):
            continue
        try:
            jobs = pull_ats(c, matchers, config)
            c["open_student_roles"] = len(jobs)
            c["roles_checked"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")
            added = 0
            for j in jobs:
                if norm(j["url"]) not in seen_urls:
                    seen_urls.add(norm(j["url"]))
                    all_jobs.append(j)
                    added += 1
            report["sources_ok"].append("ats %s (%d roles, %d new)" % (c.get("ats"), len(jobs), added))
            time.sleep(0.4)  # be polite to public APIs
        except Exception as e:
            report["sources_failed"].append("ats %s: %s" % (c.get("ats"), e))

    # Collapse the same role listed once per city (sources post "Digital
    # Construction Project Analyst" four times for four offices). Keep one row
    # and gather the locations onto it rather than showing four identical rows.
    merged = {}
    for j in all_jobs:
        key = (j["company"].strip().lower(), j["title"].strip().lower(), j["level"])
        prev = merged.get(key)
        if prev is None:
            merged[key] = j
            continue
        for loc in j["locs"]:
            if loc not in prev["locs"]:
                prev["locs"].append(loc)
        del prev["locs"][3:]
        if (j.get("posted") or "") > (prev.get("posted") or ""):
            prev["posted"] = j["posted"]
        prev["fresh"] = prev["fresh"] or j["fresh"]
        prev["coop"] = prev["coop"] or j["coop"]
    collapsed = len(all_jobs) - len(merged)
    all_jobs = list(merged.values())
    report["collapsed_duplicates"] = collapsed

    # Cap size per level, newest first, so jobs.json stays fast to load.
    # Freshman-friendly roles are exempt: they are rare (a handful out of
    # thousands) and are the whole point of the Freshman tab, so a date-ordered
    # cut would silently drop them.
    cap = int(config.get("max_jobs_per_level", 1500))
    by_level = {}
    for j in sorted(all_jobs, key=lambda j: j.get("posted") or "", reverse=True):
        by_level.setdefault(j["level"], []).append(j)
    final = []
    for level, jobs in by_level.items():
        kept = jobs[:cap]
        kept_urls = {j["url"] for j in kept}
        kept.extend(j for j in jobs[cap:] if j["fresh"] and j["url"] not in kept_urls)
        final.extend(kept)

    # Never clobber good data with a catastrophically failed run.
    if not final and os.path.exists(JOBS_PATH):
        print("ERROR: no jobs pulled; keeping previous data/jobs.json", file=sys.stderr)
        print(json.dumps(report, indent=2), file=sys.stderr)
        sys.exit(1)

    out = {
        "updated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "counts": {lvl: len([j for j in final if j["level"] == lvl]) for lvl in by_level},
        "freshman_count": len([j for j in final if j["fresh"]]),
        "report": report,
        "jobs": final,
    }
    os.makedirs(os.path.dirname(JOBS_PATH), exist_ok=True)
    with open(JOBS_PATH, "w", encoding="utf-8") as f:
        json.dump(out, f, separators=(",", ":"))
    with open(COMPANIES_PATH, "w", encoding="utf-8") as f:
        json.dump(companies_doc, f, indent=2)

    print("Wrote %d jobs (%s). Failures: %s" %
          (len(final), out["counts"], report["sources_failed"] or "none"))


if __name__ == "__main__":
    main()
