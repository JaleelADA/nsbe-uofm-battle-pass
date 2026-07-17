# 🏆 NSBE UM Battle Pass

[![Live Site](https://img.shields.io/badge/Live-Site-brightgreen)](https://jaleelada.github.io/nsbe-uofm-battle-pass/)
[![Hosted on GitHub Pages](https://img.shields.io/badge/Hosted%20on-GitHub%20Pages-blue)](https://pages.github.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

The gamified event-attendance tracker for the **National Society of Black
Engineers, University of Michigan chapter**. Members sign in at events with a
Google Form; this site turns those sign-ins into points, quartile tiers
(🥇🥈🥉🏅), badges, and a live leaderboard.

**Live site:** https://jaleelada.github.io/nsbe-uofm-battle-pass/
**Chapter info site:** https://nsbeum.weebly.com

## How it works

```
Google Form  ──►  Google Sheet  ──►  This website (GitHub Pages, free)
(sign-ins)        (responses)        (calculates points/tiers/badges in the browser)
```

No servers, no database, no build step, no hosting bills. The site is plain
HTML/CSS/JavaScript and reads the sign-in sheet directly.

## 🎓 Running it for a new semester

Everything the board changes lives in **one file: [`config.json`](config.json)** —
season name, sheet links, point values, badges, announcements.

👉 **Read [`SETUP.md`](SETUP.md)** for the click-by-click guide (no coding
needed, ~15 minutes per semester).

## Repo layout

```
index.html            Page structure
style.css             Theme (colors/fonts in :root at the top)
app.js                All logic: fetch sheet → score → render
config.json           ⭐ The only file boards edit
SETUP.md              ⭐ Board handoff & setup guide
apps-script/Code.gs   Optional privacy endpoint for private sheets
data/archive/         Past semesters' CSVs (records)
```

## Local development

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## License

MIT — see [LICENSE](LICENSE). Originally built by
[Jaleel Drones](https://github.com/JaleelADA) for NSBE UM.
