# 🛠️ Battle Pass Setup Guide (no coding needed)

This guide is for the NSBE UM board member who runs the Battle Pass. You never
need to touch code — everything is done by clicking around Google and GitHub.

**The one file you edit is [`config.json`](config.json).** Season name, sheet
links, point values, badges — it's all in there.

---

## How the system works

```
Google Form  ──►  Google Sheet  ──►  This website
(members sign     (responses         (reads the sheet, calculates
 in at events)     collect here)      points/tiers/badges automatically)
```

There is no database and no server. The website is free forever on GitHub
Pages and updates itself whenever someone signs in or you edit `config.json`.

---

## 🎓 New school year / new semester checklist (~15 minutes)

### 1. Set up the sign-in form (5 min)

1. Go to [Google Forms](https://forms.google.com) **while logged into the chapter Google account** (don't use a personal account — it must survive board turnover).
2. Reuse last year's sign-in form, or make a copy of it (⋮ menu → *Make a copy*).
3. The form needs at minimum these two questions (this exact wording of the titles matters — the site looks for these words):
   - **Uniqname** (short answer)
   - **Event** (short answer or dropdown — e.g. GBM, Professional Development, P-Zone, Social…)
   - Optional: *Did you bring a friend?* (Yes/No) and *How many* (number) — these award bonus points automatically.
4. In the form, open the **Responses** tab → click the green Sheets icon → **Create spreadsheet**. This is where sign-ins collect.

### 2. Connect the sheet to the website (5 min)

Pick ONE of these two options:

**Option A — Simple (recommended to start):**

1. Open the responses spreadsheet.
2. Click **Share** (top right) → under *General access* choose **Anyone with the link** → **Viewer** → Done.
3. Copy the spreadsheet's URL from your browser's address bar (make sure you're on the *Form Responses* tab when you copy it).
4. Go to this repository on GitHub → click `config.json` → click the ✏️ **pencil icon**.
5. Paste your URL between the quotes of `"signInDataUrl"`, replacing the old link:
   ```
   "signInDataUrl": "https://docs.google.com/spreadsheets/d/YOUR-SHEET-LINK-HERE/edit#gid=123456",
   ```
6. Also update `"season"` (e.g. `"Fall 2026"`) and `"countPointsFrom"` (the date the new semester starts — anything signed in before this date is ignored).
7. Scroll down → **Commit changes**. The live site updates itself within ~1 minute.

> ⚠️ Option A makes the response sheet readable by anyone who has the link.
> If your form collects emails/full names, use Option B instead, or remove
> those questions from the form.

**Option B — Private sheet (keeps emails & names hidden):**

1. Keep the spreadsheet private (no sharing needed).
2. In the spreadsheet: **Extensions → Apps Script**.
3. Delete whatever is in the editor and paste the entire contents of [`apps-script/Code.gs`](apps-script/Code.gs) from this repo.
4. Click **Deploy → New deployment → ⚙️ Select type → Web app**.
   - *Execute as*: **Me**
   - *Who has access*: **Anyone**
5. Click **Deploy**, authorize the account, and **copy the Web app URL** (ends in `/exec`).
6. Paste that URL into `"signInDataUrl"` in `config.json` (step 4–7 of Option A).

The script only shares Timestamp + Uniqname + Event with the website — emails
and names never leave the private sheet.

### 3. Paid members list (2 min, optional)

If you track paid members in a sheet, share it as *Anyone with link → Viewer*
and paste its URL into `"paidMembersUrl"`. The site matches members by
uniqname/email found anywhere in that sheet. Paid members bypass the
5-point-per-event cap (see `"unpaidPointsCap"`). Leave `"paidMembersUrl"` as
`""` to skip paid tracking entirely.

### 4. Archive last semester (2 min, optional but nice)

1. In last semester's response sheet: **File → Download → CSV**.
2. On GitHub, open the `data/archive/` folder → **Add file → Upload files** → drop the CSV in (make a folder per semester, e.g. `fall_2026/`).

---

## ✏️ Common tweaks (all in `config.json`)

| I want to… | Edit this |
|---|---|
| Change the semester name shown on the site | `"season"` |
| Change when points start counting | `"countPointsFrom"` (YYYY-MM-DD) |
| Change the "days left" countdown | `"seasonEndDate"` (YYYY-MM-DD, last day of classes) |
| Change points per event type | the `"points"` number inside `"eventTypes"` |
| Add a new event type | copy an existing line in `"eventTypes"`, change the name/points/keywords |
| Change how form answers map to event types | the `"keywords"` lists (matching is case-insensitive) |
| Add/change badges | the `"badges"` list (types: `paid`, `category`, `total`, `variety`) |
| Update the sign-in form / Linktree / Weebly links | `"links"` and `"announcements"` |
| Remove the unpaid points cap | set `"unpaidPointsCap"` to `null` |

**Editing tip:** JSON is picky — every line inside a list ends with a comma
*except the last one*, and text needs `"quotes"`. If the site shows a
"config.json could not be read" message after your edit, view the file's
**History** on GitHub and compare with your change, or re-edit and fix the
missing comma/quote. You can validate the file for free at
[jsonlint.com](https://jsonlint.com) — paste the whole file, click Validate.

---

## 💼 Jobs & Companies pages (run themselves)

The Jobs page and Companies page refresh automatically every Monday via the
"Update careers data" workflow (repo → Actions tab → you can also click
**Run workflow** anytime). Board maintenance is just:

- **Each recruiting cycle (~August):** in `jobs-config.json`, update the
  `sources` and `extra_sources` URLs to the new season's tracker repos (e.g.
  change `Summer2026-Internships` → `Summer2027-Internships`).
- **Anytime:** edit `data/companies.json` to update outreach statuses
  (target/contacted/confirmed/sponsor), add companies, and keep the `events`
  list and `recruiting_cycles` timeline current. To get live role counts for
  a company, add an `"ats"` field:
  - `"greenhouse:SLUG"` or `"lever:SLUG"` — the slug is in the company's job
    board URL (e.g. `boards.greenhouse.io/rocketlab` → `rocketlab`).
  - `"workday:HOST/TENANT/SITE"` — from the company's Workday careers URL
    `https://HOST/en-US/SITE` where HOST looks like `cat.wd5.myworkdayjobs.com`
    and TENANT is the first part of the host (`cat`). Most big ME/EE/Civil/
    ChemE/Aero employers use Workday, so this is how those majors get
    coverage.
  A wrong slug never breaks the site — it just shows up under
  `sources_failed` inside `data/jobs.json` after the weekly run.
- **Tuning:** job keywords, career pathways, resources, and the first-year
  program list all live in `jobs-config.json`.
- **Don't want to hunt for the feed URL?** Add 2–3 guesses under the company's
  name in `data/feed-candidates.json` and run the **Verify job feeds** workflow
  (Actions tab). It probes each guess, keeps whichever actually returns roles,
  writes it into `data/companies.json`, and lists whatever it couldn't find in
  `data/feed-report.json`.
- **A role filed under the wrong major?** Add the phrase to
  `taxonomy_exclusions` in `jobs-config.json` (e.g. "civil liberties" under
  `Civil`, so a privacy-software job stops counting as civil engineering).
  Non-engineering roles slipping in from an employer feed? Add the phrase to
  `non_engineering_titles`.

> **Why some majors show few roles.** The community trackers this pulls from
> are software-heavy, so Civil, Nuclear, ChemE and BME openings mostly live on
> employers' own career sites. Those numbers grow as more employer feeds get
> verified — that is what the Verify job feeds workflow is for. A major showing
> a handful of roles usually means "we don't have those employers' feeds yet",
> not "there are no jobs".

## 🤝 Board handoff checklist (do this every spring)

- [ ] Add the incoming webmaster/membership chair as a **collaborator** on this GitHub repo (Settings → Collaborators), or better: move the repo to a chapter-owned GitHub organization.
- [ ] Make sure the Google Form + Sheets are owned by the **chapter Google account**, and share that account's login through your board's password handoff.
- [ ] Walk them through this file. The whole system is: Form → Sheet → `config.json`.
- [ ] Update `"season"` and `"countPointsFrom"` when the new semester starts.

---

## 🚑 Troubleshooting

| Symptom | Fix |
|---|---|
| Site says "Almost there — connect your Google Sheet" | `"signInDataUrl"` in `config.json` is empty. Follow step 2 above. |
| "Could not read the sign-in data" | The sheet isn't shared. Share → *Anyone with the link* → *Viewer*. If using Apps Script, re-deploy and check *Who has access: Anyone*. |
| Leaderboard is empty | No sign-ins yet this semester (normal before school starts), or `"countPointsFrom"` is set to a future date, or the sheet URL points to the wrong tab — copy the URL while looking at the *Form Responses* tab. |
| Someone's points look wrong | Check the sheet for duplicate rows (the site already ignores exact same person+event+day duplicates), and check the event name matches a `"keywords"` entry — unmatched events score `"otherEventPoints"`. |
| Site didn't update after my edit | GitHub Pages takes ~1 minute to rebuild. Hard-refresh (Ctrl+Shift+R). |
| "config.json could not be read" | A typo from the last edit — usually a missing comma or quote. Paste the file into jsonlint.com to find the exact line. |

Questions? Open an issue on this repo or email the previous webmaster.
