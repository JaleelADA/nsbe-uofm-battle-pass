# Careers Intelligence Platform — Roadmap

Vision: the intelligence layer that helps every engineering student — across
CS, CE, EE, ME, IOE, Aero, BME, ChemE, Civil, Nuclear, Robotics, MatSci, DS —
discover opportunities, understand recruiting cycles, connect with employers,
and build a path from freshman year to full-time.

## Phase 1 — SHIPPED (this repo, $0/month)

- **Weekly pipeline** (GitHub Actions, Mondays): pulls SimplifyJobs community
  trackers (~1.2k internships + ~1.9k new-grad roles live today) + public
  Greenhouse/Lever job boards for curated employers; classifies every role
  into 14 engineering disciplines & ~40 specializations via the keyword
  taxonomy in `jobs-config.json` (95%+ coverage, measured).
- **Careers page**: Freshman & Early / Internships / Full-Time tabs, discipline
  chips, search, co-op & recency filters, profile persistence (major + year,
  device-local), career pathway maps, evergreen first-year program directory
  (STEP, Explore, Meta U, Path, Propel, Code2040, NSF REU…).
- **Company Hub**: 65-employer intelligence DB — sectors, majors recruited,
  student-org recruiting channels (NSBE/SWE/SHPE/IEEE/SAE/AIChE/BMES/ASCE),
  NSBE-partner flags, outreach status tracker, live open-role counts, and the
  recruiting events calendar.

## Phase 1.5 — IN PROGRESS (this branch)

Shipped in this pass (July 2026):

- **Workday connector** — the pipeline now reads the public Workday JSON feeds
  that most large ME/EE/Civil/ChemE/Aero/BME employers use. 15 tenants
  verified live: Boeing, GM, Caterpillar, Northrop, GE Aerospace, Medtronic,
  Stryker, Abbott, J&J, 3M, Dow, Chevron, P&G, GE HealthCare, Applied
  Materials. This is the fix for the software skew called out below.
- **More community sources** — vanshb03 internship + new-grad trackers (same
  listings format, deduped by URL and company+title) add ~700 unique live
  roles including strong fall/winter co-op coverage; off-cycle `terms` from
  the Simplify feed now flow into the co-op filter.
- **8 new Greenhouse feeds** for aero/robotics/energy startups: Rocket Lab,
  Astranis, Neuralink, Figure AI, Varda, Nuro, Lucid, Waymo.
- **Employer DB grown 65 → 89** with Civil (Turner, Burns & McDonnell, HDR,
  Kimley-Horn), Nuclear (Westinghouse, Holtec, X-energy), Robotics, MatSci,
  BME employers and Michigan anchors (Holtec/Palisades, ITC, FANUC, Marathon).
- **Recruiting-cycle calendar** — per-industry application windows
  (`recruiting_cycles` in companies.json) rendered as a timeline on the
  Companies page, with per-industry tips.
- **2026–27 events calendar** — verified dates for NSBE Convention/FRC,
  SWE WE26, SHPE NC, AIChE, BMES, IEEE virtual fair, SAE WCX/FSAE, and the
  U-M career fairs.
- **UI overhaul** — Jobs + Companies pages moved off the Battle Pass theme
  onto a clean job-platform design (`platform.css`, light/dark): sidebar
  facets with counts, saved jobs (☆, device-local), sponsorship flags,
  location/posted filters, deep links (`?q=` / `&level=` / `&disc=`), and
  cross-links from each company card to its live roles. Gamification stays
  on the Battle Pass page.

Still open (board, each semester):

- Fill real outreach statuses + campus career-fair employer lists
  (`data/companies.json`).
- Taxonomy tuning as misclassified titles surface (edit `jobs-config.json`).
- Roll tracker source URLs forward each recruiting cycle (~August).
- Candidate for next pass: markdown-table parser for the jobright-ai
  engineering trackers (the only daily non-CS lists found — Civil/ME/EE —
  but links are tracking redirects; linked from the Jobs page for now).

## Phase 2 — multi-org / multi-school

The whole stack is config-driven and free, so any chapter or org (SWE, SHPE,
IEEE at UM; NSBE chapters at Georgia Tech, Purdue, UIUC, …) can fork the repo,
edit two JSON files, and have the same platform. Pilot: share with 2–3 sibling
NSBE chapters, collect feedback, extract a template repo.

## Phase 3 — the intelligence layer (requires backend + partnerships)

These need real infrastructure (accounts, DB, agreements) — deliberately out
of scope for a static site:

- **Compensation data**: levels.fyi has no public API and scraping violates
  its ToS — we link out today; a real integration needs a data partnership.
- **Handshake**: login-walled, no public API — we deep-link to UM Handshake.
- **True recommendation engine**: profile → ranked matches needs accounts,
  feedback loops, and outcome data (who applied, who got offers).
- **Student outcomes tracking**: opt-in offer/placement reporting per chapter
  → the data that makes this genuinely "Bloomberg for engineering careers."
- Employer-side dashboard: chapters selling engagement analytics to sponsors.

## Honest constraints

- Simplify's trackers skew software/hardware; ME/Civil/ChemE coverage comes
  from the ATS employer feeds and will grow as more employers are added with
  `ats` slugs. Every listing links to the employer's official posting.
- Partner flags and program windows are curated — verify annually.
- Respect robots.txt/ToS everywhere: we only consume public JSON endpoints
  and community-maintained open-source datasets, with attribution.
