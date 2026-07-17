# NSBE UofM Battle Pass — Rebuild & Simplification Plan

_Last updated: July 2026_

> **Status:** Phases 0–2 are DONE (this branch): site restored on free GitHub
> Pages, full rewrite to a no-build vanilla JS app configured entirely through
> `config.json`, board guide in `SETUP.md`. Phase 3 (moving the repo to a
> chapter GitHub org and the Google account handoff) is a manual step for the
> board — checklist at the bottom of `SETUP.md`.

## Where things stand

- The site is a **static site already hosted free on GitHub Pages**. It appears "down" only because the `CNAME` file points to the expired domain `nsbeum.live`, which breaks both the custom domain **and** the fallback `github.io` URL.
- The codebase is ~4,800 lines of no-build React (CDN + Babel-in-browser), with data flowing from Google Forms → Google Sheets → an Apps Script endpoint.
- The chapter's general-info site lives on Weebly (NSBEUM). The Battle Pass site currently duplicates some info content (mentorship hub, resources) that could live on Weebly instead.

## Phase 0 — Bring the site back online (Day 1, free)

1. **Delete the `CNAME` file** and push to `main`. The site immediately comes back at:
   `https://jaleelada.github.io/nsbe-uofm-battle-pass/`
2. Verify GitHub Pages is still enabled (Settings → Pages → deploy from `main`, root).
3. Update the README badge/links to the new URL.
4. Add a prominent "Battle Pass" link/button on the Weebly site pointing to the github.io URL, and regenerate any QR codes/Linktree entries.

> No domain purchase needed. The github.io URL never expires and never bills anyone.

## Hosting options compared

| Option | Cost | Notes |
|---|---|---|
| **GitHub Pages (current)** ✅ | Free forever | Already configured. URL: `jaleelada.github.io/nsbe-uofm-battle-pass`. Recommended — zero migration. Consider moving the repo to a chapter-owned GitHub org so it survives e-board turnover. |
| Cloudflare Pages | Free | Free `*.pages.dev` subdomain (e.g. `nsbeum.pages.dev` — shorter/cleaner). Connects to the same GitHub repo; auto-deploys on push. Good option if a nicer free URL matters. |
| Netlify / Vercel | Free tier | Similar to Cloudflare Pages (`nsbeum.netlify.app`). Free tiers are fine for this traffic. |
| Renew `nsbeum.live` | ~$25–35/yr | Recurring cost and a renewal that must survive e-board turnover — this is exactly what broke the site. Not recommended. |
| Cheaper custom domain (`.org`/`.com`) | ~$10–15/yr | Only if a memorable domain is a hard requirement. Put it on a chapter card/account, set auto-renew, and document the registrar login in the e-board handoff doc. |
| GitHub Student Developer Pack domain | Free for 1 yr | Free `.me` domain via Namecheap — but it expires with the student, recreating the same problem. Avoid. |

**Recommendation:** stay on GitHub Pages with the free github.io URL (optionally add Cloudflare Pages for the shorter `nsbeum.pages.dev` name). Let the Weebly site be the "front door" people remember; the Battle Pass URL is just a link/QR code from there.

## Phase 1 — Simplify the semester process (the real pain point)

The recurring workload isn't hosting — it's the per-semester reset (new sheet IDs, point values, event columns scattered through `src/LocalDataManager.js` and `src/Data-Constants.js`, evidenced by commits like "Fix: Update SHEETS_CONFIG…").

1. **Single `config.json`** at the repo root holding everything that changes per semester:
   - Season name (e.g. "Winter 2026")
   - Google Sheet ID / Apps Script endpoint URL
   - Point values per event type
   - Badge definitions and tier rules
   The app loads this at startup; nobody touches JS files for a new semester.
2. **Write a `SEMESTER_RESET.md` runbook** (~15-minute checklist): duplicate the sign-in Form/Sheet, archive last semester's CSVs to `data/archive/`, update `config.json`, push. Anyone on e-board can follow it.
3. **Keep the existing data pipeline** (Forms → Sheets → Apps Script endpoint). It already avoids exposing PII and costs nothing.

## Phase 2 — Slim the codebase

Goal: cut ~4,800 lines to something a future webmaster can grok in an afternoon.

1. **Divide content with Weebly**: move static info content (mentorship program details, resources, academic corner) to the Weebly site and link out. The Battle Pass site keeps only the gamified tracker: leaderboard, personal progress, badges. This removes most of `MentorshipHUB.js` and `InfoSidebar.js`.
2. **Remove dead admin code**: the admin dashboard HTML was already deleted; `AdminPanel.js` (628 lines) can likely go too.
3. **Fold `DataCleanser` + `helpers` into `LocalDataManager`** and delete unused paths (old CSV fallbacks, legacy header formats from past semesters).
4. **Fix the fragile CDN setup**: replace `react.development.js` + Babel-standalone (slow, and unpkg outages take the site down) with either:
   - production React UMD builds and pre-compiled JS (no JSX in the browser), **or**
   - a small Vite build with a GitHub Action that deploys to Pages on push (still free, ~20 lines of workflow).
   Either is fine; the first keeps the "no build step" simplicity.

## Phase 3 — Handoff-proofing (so this never breaks again)

- Transfer the repo to a chapter GitHub **organization** (e.g. `nsbe-uofm`) with multiple e-board admins, so access doesn't depend on one person's account.
- Keep Google Sheet/Form ownership on a shared chapter Google account (e.g. nsbe.membership@umich.edu), not a personal one.
- Document everything in the README: the live URL, how data flows, the semester-reset runbook, and who has access to what.

## Suggested order of work

| Step | Effort | Outcome |
|---|---|---|
| Phase 0: delete CNAME, update links | 30 min | Site back online, free |
| Phase 1: config.json + runbook | 1–2 evenings | Semester reset becomes a 15-min task |
| Phase 2: trim code, prod builds | 1–2 weekends | Smaller, faster, more reliable site |
| Phase 3: org transfer + docs | 1 evening | Survives e-board turnover |
