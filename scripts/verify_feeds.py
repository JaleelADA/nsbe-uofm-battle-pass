#!/usr/bin/env python3
"""
Probe candidate job feeds and keep the ones that actually work.

Why this exists: most large Civil / Nuclear / Energy employers publish their
openings through Workday, Greenhouse or Lever, but the exact tenant URL can't
be guessed reliably. data/feed-candidates.json holds a few plausible URLs per
company; this script tries each one, keeps the first that returns real student
roles, writes it into data/companies.json, and records everything in
data/feed-report.json.

Run it from the Actions tab ("Verify job feeds"). One lightweight request per
candidate, with a pause between them.

  python scripts/verify_feeds.py [--all]

  --all   also re-check feeds that are already configured (default: only
          companies that have no feed yet)
"""

import json
import os
import sys
import time
import urllib.request
import urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COMPANIES_PATH = os.path.join(ROOT, "data", "companies.json")
CANDIDATES_PATH = os.path.join(ROOT, "data", "feed-candidates.json")
REPORT_PATH = os.path.join(ROOT, "data", "feed-report.json")

UA = {"User-Agent": "nsbe-um-battle-pass-careers/1.0 (github.com/JaleelADA/nsbe-uofm-battle-pass)"}
TIMEOUT = 25
PAUSE = 1.0  # seconds between probes — be a good citizen


def _get(url, post_body=None):
    data = json.dumps(post_body).encode("utf-8") if post_body is not None else None
    headers = dict(UA)
    headers["Accept"] = "application/json"
    if data:
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=headers)
    with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
        return json.loads(resp.read().decode("utf-8"))


def probe(feed):
    """Returns (ok, count, detail). One request, smallest page possible."""
    kind, _, slug = feed.partition(":")
    try:
        if kind == "workday":
            parts = slug.split("/")
            if len(parts) != 3:
                return False, 0, "bad slug (need HOST/TENANT/SITE)"
            host, tenant, site = parts
            url = "https://%s/wday/cxs/%s/%s/jobs" % (host, tenant, site)
            data = _get(url, {"appliedFacets": {}, "limit": 20, "offset": 0, "searchText": "intern"})
            total = int(data.get("total", 0) or 0)
            posts = data.get("jobPostings", []) or []
            if not posts and not total:
                return False, 0, "reachable but no intern postings"
            return True, total or len(posts), "ok (%d matching 'intern')" % (total or len(posts))

        if kind == "greenhouse":
            data = _get("https://boards-api.greenhouse.io/v1/boards/%s/jobs" % slug)
            jobs = data.get("jobs", []) or []
            if not jobs:
                return False, 0, "board exists but empty"
            return True, len(jobs), "ok (%d open roles)" % len(jobs)

        if kind == "lever":
            data = _get("https://api.lever.co/v0/postings/%s?mode=json" % slug)
            if not isinstance(data, list) or not data:
                return False, 0, "board exists but empty"
            return True, len(data), "ok (%d open roles)" % len(data)

        if kind == "ashby":
            data = _get("https://api.ashbyhq.com/posting-api/job-board/%s" % slug)
            jobs = (data or {}).get("jobs", []) or []
            if not jobs:
                return False, 0, "board exists but empty"
            return True, len(jobs), "ok (%d open roles)" % len(jobs)

        return False, 0, "unknown feed kind: " + kind
    except urllib.error.HTTPError as e:
        return False, 0, "HTTP %s" % e.code
    except Exception as e:  # noqa: BLE001 - report whatever went wrong, keep going
        return False, 0, str(e)[:120]


def main():
    check_all = "--all" in sys.argv

    with open(COMPANIES_PATH, encoding="utf-8") as f:
        doc = json.load(f)
    with open(CANDIDATES_PATH, encoding="utf-8") as f:
        candidates = json.load(f).get("candidates", {})

    by_name = {c["name"]: c for c in doc.get("companies", [])}
    report = {"checked": [], "promoted": [], "still_missing": [], "broken": []}

    # 1. Re-check feeds that are already configured.
    if check_all:
        for c in doc.get("companies", []):
            if not c.get("ats"):
                continue
            ok, n, detail = probe(c["ats"])
            report["checked"].append({"company": c["name"], "feed": c["ats"], "ok": ok, "detail": detail})
            if not ok:
                report["broken"].append("%s (%s): %s" % (c["name"], c["ats"], detail))
            print("%-28s %-58s %s" % (c["name"][:28], c["ats"][:58], detail))
            time.sleep(PAUSE)

    # 2. Try candidates for companies with no feed.
    for name, feeds in candidates.items():
        company = by_name.get(name)
        if company is None:
            report["still_missing"].append("%s: not in companies.json" % name)
            print("SKIP %-24s not in companies.json" % name[:24])
            continue
        if company.get("ats") and not check_all:
            continue

        won = None
        for feed in feeds:
            ok, n, detail = probe(feed)
            print("%-28s %-58s %s" % (name[:28], feed[:58], detail))
            report["checked"].append({"company": name, "feed": feed, "ok": ok, "detail": detail})
            time.sleep(PAUSE)
            if ok:
                won = (feed, n, detail)
                break

        if won:
            company["ats"] = won[0]
            report["promoted"].append({"company": name, "feed": won[0], "roles": won[1]})
            print("  -> PROMOTED %s = %s" % (name, won[0]))
        else:
            report["still_missing"].append("%s: no candidate worked — find it by hand (see feed-candidates.json)" % name)

    with open(COMPANIES_PATH, "w", encoding="utf-8") as f:
        json.dump(doc, f, indent=2)
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print("\n=== summary ===")
    print("promoted:      %d" % len(report["promoted"]))
    for p in report["promoted"]:
        print("   + %-26s %s (%d roles)" % (p["company"], p["feed"], p["roles"]))
    print("still missing: %d" % len(report["still_missing"]))
    for s in report["still_missing"]:
        print("   - %s" % s)
    if report["broken"]:
        print("broken existing feeds: %d" % len(report["broken"]))
        for b in report["broken"]:
            print("   ! %s" % b)


if __name__ == "__main__":
    main()
