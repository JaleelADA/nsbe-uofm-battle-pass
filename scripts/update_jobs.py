#!/usr/bin/env python3
"""
NSBE UM Careers pipeline — runs weekly via .github/workflows/update-jobs.yml.

Pulls engineering internship / new-grad listings from:
  1. SimplifyJobs listing JSONs (community-maintained, structured) — URLs in
     jobs-config.json, update the repo year in "sources" each recruiting cycle.
  2. Public ATS APIs (Greenhouse / Lever) for every company in
     data/companies.json that declares an "ats" slug.

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


def fetch_json(url, fixture_name):
    if FIXTURES:
        path = os.path.join(FIXTURES, fixture_name + ".json")
        if not os.path.exists(path):
            raise RuntimeError("fixture missing: " + path)
        with open(path) as f:
            return json.load(f)
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=45) as resp:
        return json.loads(resp.read().decode("utf-8"))


# ---------------------------------------------------------------- classify --

def build_matchers(config):
    matchers = []  # (discipline, category, compiled_regex)
    for disc, cats in config["taxonomy"].items():
        for cat, kws in cats.items():
            for kw in kws:
                matchers.append((disc, cat, re.compile(r"\b" + re.escape(kw))))
    return matchers


def classify(title, simplify_category, matchers, config):
    """Returns (disciplines, categories) for a job title."""
    t = " " + title.lower() + " "
    discs, cats = [], []
    for disc, cat, rx in matchers:
        if rx.search(t):
            if disc not in discs:
                discs.append(disc)
            if cat not in cats:
                cats.append(cat)
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


def pull_simplify(url, level, matchers, config, fixture_name):
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
            jobs.append(slim(company, title, job_url, x.get("locations"), level,
                             discs, cats, posted, x.get("sponsorship"), "simplify", config))
        except Exception:
            continue  # one malformed row never kills the run
    return jobs


ROLE_RX = re.compile(r"\bintern|\bco[- ]?op\b|new grad|university grad|entry level|early career|campus hire|graduate engineer|rotational", re.I)


def pull_ats(company_entry, matchers, config):
    """Greenhouse/Lever public boards -> student-relevant roles + open count."""
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
            level = "newgrad" if re.search(r"new grad|entry|early career|graduate|rotational", title, re.I) \
                    and not re.search(r"intern", title, re.I) else "intern"
            discs, cats = classify(title, None, matchers, config)
            posted = str(p.get("updated_at", ""))[:10]
            loc = (p.get("location") or {}).get("name", "")
            jobs.append(slim(name, title, p.get("absolute_url", ""), [loc] if loc else [],
                             level, discs, cats, posted, "", "greenhouse", config))
    elif kind == "lever":
        postings = fetch_json("https://api.lever.co/v0/postings/%s?mode=json" % slug, "lever-" + slug)
        for p in postings:
            title = str(p.get("text", ""))
            if not ROLE_RX.search(title):
                continue
            level = "newgrad" if re.search(r"new grad|entry|early career|graduate|rotational", title, re.I) \
                    and not re.search(r"intern", title, re.I) else "intern"
            discs, cats = classify(title, None, matchers, config)
            posted = ""
            if isinstance(p.get("createdAt"), (int, float)):
                posted = datetime.fromtimestamp(p["createdAt"] / 1000, tz=timezone.utc).strftime("%Y-%m-%d")
            loc = ((p.get("categories") or {}).get("location")) or ""
            jobs.append(slim(name, title, p.get("hostedUrl", ""), [loc] if loc else [],
                             level, discs, cats, posted, "", "lever", config))
    else:
        raise RuntimeError("unknown ats kind: " + ats)
    return jobs


# --------------------------------------------------------------------- main --

def main():
    with open(CONFIG_PATH) as f:
        config = json.load(f)
    matchers = build_matchers(config)
    report = {"sources_ok": [], "sources_failed": []}
    all_jobs = []

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

    # ATS enrichment for the curated employer database.
    companies_doc = {"companies": [], "events": []}
    if os.path.exists(COMPANIES_PATH):
        with open(COMPANIES_PATH) as f:
            companies_doc = json.load(f)

    seen_urls = {j["url"] for j in all_jobs}
    for c in companies_doc.get("companies", []):
        if not c.get("ats"):
            continue
        try:
            jobs = pull_ats(c, matchers, config)
            c["open_student_roles"] = len(jobs)
            c["roles_checked"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")
            added = 0
            for j in jobs:
                if j["url"] not in seen_urls:
                    seen_urls.add(j["url"])
                    all_jobs.append(j)
                    added += 1
            report["sources_ok"].append("ats %s (%d roles, %d new)" % (c.get("ats"), len(jobs), added))
            time.sleep(0.4)  # be polite to public APIs
        except Exception as e:
            report["sources_failed"].append("ats %s: %s" % (c.get("ats"), e))

    # Cap size per level, newest first, so jobs.json stays fast to load.
    cap = int(config.get("max_jobs_per_level", 1500))
    by_level = {}
    for j in sorted(all_jobs, key=lambda j: j.get("posted") or "", reverse=True):
        by_level.setdefault(j["level"], []).append(j)
    final = []
    for level, jobs in by_level.items():
        final.extend(jobs[:cap])

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
    with open(JOBS_PATH, "w") as f:
        json.dump(out, f, separators=(",", ":"))
    with open(COMPANIES_PATH, "w") as f:
        json.dump(companies_doc, f, indent=2)

    print("Wrote %d jobs (%s). Failures: %s" %
          (len(final), out["counts"], report["sources_failed"] or "none"))


if __name__ == "__main__":
    main()
