# NSBE UofM Points

A simple read-only points website for the NSBE University of Michigan chapter.

The point system is maintained in Google Forms and Google Sheets. The website only displays the published leaderboard CSV, so future chairs do not need to maintain a backend, Supabase project, admin panel, or JavaScript point rules.

## How It Works

1. Members sign in through a Google Form.
2. Google Sheets calculates points from the form responses.
3. The `Leaderboard` tab is published as a CSV.
4. This website reads that CSV and displays the chapter leaderboard.

## Files Future Chairs May Edit

Most years, only this file needs to change:

```text
src/AppConfig.js
```

Update these values:

```javascript
leaderboardCsvUrl: 'PASTE_PUBLISHED_LEADERBOARD_CSV_LINK_HERE',
signInFormUrl: 'PASTE_GOOGLE_FORM_LINK_HERE',
schoolYear: '2026-27'
```

## Point Tracking Guide

See [POINT_TRACKING_GUIDE.md](POINT_TRACKING_GUIDE.md) for the Google Form, Google Sheet tabs, and formulas.

## Local Preview

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

## Active Website Files

```text
index.html
src/AppConfig.js
src/SimpleLeaderboard.js
POINT_TRACKING_GUIDE.md
```

The older Battle Pass files are kept in the repository for reference, but they are no longer loaded by `index.html`.
