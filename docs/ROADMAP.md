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

## Phase 1.5 — next (still $0, config/data work)

- More sources: additional community trackers (quant/hardware-specific lists),
  NSF REU search deep links per discipline, co-op boards.
- Board fills real outreach statuses + campus career-fair employer lists each
  semester (`data/companies.json`).
- Taxonomy tuning as misclassified titles surface (edit `jobs-config.json`).
- Recruiting-cycle calendar: per-industry "applications open" timeline data.

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
