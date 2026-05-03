# NSBE UofM Point Tracking Guide

This system is designed so a future chair can run chapter points from Google Forms and Google Sheets. The website only displays the published leaderboard CSV.

## Yearly Workflow

1. Keep one Google Sheet named `NSBE Points - Current Year`.
2. Before a new school year starts, copy the old `Attendance` and `Leaderboard` tabs into an archive sheet.
3. Clear the current `Attendance` tab.
4. Update the `Events` tab with this year's event codes and point values.
5. Keep the same published `Leaderboard` CSV link whenever possible.

## Google Form

Use one attendance form for the year.

Recommended questions:

| Question | Type | Required |
| --- | --- | --- |
| Name | Short answer | Yes |
| Uniqname | Short answer | Yes |
| Email | Short answer | Yes |
| Event Code | Short answer or dropdown | Yes |

The event code should match the `Events` tab exactly. Examples: `GBM1`, `RESUME`, `STUDY2`, `CONVENTION`.

## Google Sheet Tabs

Use these three tabs.

### Events

| Event Code | Event Name | Date | Category | Points |
| --- | --- | --- | --- | --- |
| GBM1 | General Body Meeting 1 | 2026-09-12 | GBM | 7 |
| RESUME | Resume Workshop | 2026-09-19 | Professional Development | 10 |

### Attendance

This is the Google Form response tab. Add one extra column named `Points`.

Assuming:

- `A` = Timestamp
- `B` = Name
- `C` = Uniqname
- `D` = Email
- `E` = Event Code
- `F` = Points

Put this formula in `F2`:

```text
=ARRAYFORMULA(IF(E2:E="","",IFERROR(VLOOKUP(E2:E,Events!A:E,5,FALSE),0)))
```

### Leaderboard

Use these headers:

| Rank | Uniqname | Points | Events |
| --- | --- | --- | --- |

Put this formula in `B2`:

```text
=QUERY({Attendance!C2:C,Attendance!F2:F},"select Col1, sum(Col2), count(Col1) where Col1 is not null group by Col1 order by sum(Col2) desc label Col1 '', sum(Col2) '', count(Col1) ''",0)
```

Put this formula in `A2`:

```text
=ARRAYFORMULA(IF(B2:B="","",RANK(C2:C,C2:C,0)))
```

The website can display more columns if you add them later, but these four are enough.

## Bonuses And Corrections

The simplest correction method is to add a special event code.

Examples:

| Event Code | Event Name | Date | Category | Points |
| --- | --- | --- | --- | --- |
| BONUS5 | Chair Bonus | 2026-10-01 | Bonus | 5 |
| FIX-5 | Manual Correction | 2026-10-01 | Correction | -5 |

Then submit the attendance form once for that member with the special event code.

## Publishing The Leaderboard

1. In Google Sheets, open `File`.
2. Select `Share`.
3. Select `Publish to web`.
4. Choose the `Leaderboard` tab.
5. Choose `Comma-separated values (.csv)`.
6. Copy the published CSV link.

If the same current-year sheet is reused, this link can stay the same across years.

## Website Setup

The website reads only one setup file:

```text
src/AppConfig.js
```

Most years, only these values matter:

```javascript
leaderboardCsvUrl: 'PASTE_PUBLISHED_LEADERBOARD_CSV_LINK_HERE',
signInFormUrl: 'PASTE_GOOGLE_FORM_LINK_HERE',
schoolYear: '2026-27'
```

The rest of the website should not need edits.

## What Not To Maintain

Future chairs do not need Supabase, a custom admin panel, badge logic, or JavaScript point rules. If a point value changes, update the `Events` tab in Google Sheets.
