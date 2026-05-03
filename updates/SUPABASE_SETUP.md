# Supabase Setup For NSBE Battle Pass

This app can now use Supabase as the primary leaderboard backend instead of Google Sheets.

## What Changed

- `src/AppConfig.js` controls which backend the app uses.
- `src/SupabaseDataManager.js` reads members and attendance from Supabase.
- `src/LocalDataManager.js` now prefers Supabase when configured, but can still fall back to Google Sheets.
- `supabase/schema.sql` creates the tables and row-level security policies for a shared chapter-owned backend.

## Recommended Ownership Model

- Create the Supabase project under a chapter-owned email or shared org account.
- Keep the frontend repo in a chapter GitHub organization, not a personal account.
- Give the chair and one backup officer admin access to Supabase.
- Use chapter emails in `chapter_admins`, not personal Gmail accounts.

## 1. Create The Supabase Project

1. Create a Supabase project.
2. Open the SQL editor.
3. Run [`supabase/schema.sql`](/Users/jaleeldrones-akins/nsbe-uofm-battle-pass-2/supabase/schema.sql).

## 2. Seed The First Admin

Insert the current chair into `chapter_admins` from the Supabase table editor or SQL editor:

```sql
insert into public.chapter_admins (email, role)
values ('your-chair-email@umich.edu', 'chair')
on conflict (email) do nothing;
```

This bootstrap step is manual on purpose. It prevents random authenticated users from becoming admins.

## 3. Configure The Frontend

Edit [`src/AppConfig.js`](/Users/jaleeldrones-akins/nsbe-uofm-battle-pass-2/src/AppConfig.js):

```js
window.APP_CONFIG = {
  dataSource: 'supabase',
  supabase: {
    enabled: true,
    url: 'https://YOUR_PROJECT.supabase.co',
    anonKey: 'YOUR_SUPABASE_ANON_KEY',
    schema: 'public',
    attendanceTable: 'attendance_logs',
    membersTable: 'members',
    realtimeTables: ['attendance_logs', 'members']
  }
};
```

`dataSource: 'auto'` will use Supabase only when configured and otherwise fall back to Google Sheets. `dataSource: 'supabase'` forces the app to use Supabase only.

## 4. Import Existing Data

### Members table

Expected columns:

- `uniqname`
- `email`
- `display_name`
- `major`
- `year`
- `is_paid`
- `national_dues`

### Attendance table

Expected columns:

- `uniqname`
- `email`
- `full_name`
- `event_name`
- `event_category`
- `attended_at`
- `brought_friend`
- `friend_count`
- `major`
- `year`
- `paid_national_dues`
- `source`

The frontend maps these rows into the legacy shape your current points engine already understands.

## 5. Realtime Leaderboard

The leaderboard component now subscribes to Supabase Postgres changes when Supabase is enabled. New attendance rows should refresh the leaderboard without waiting for the 5-minute polling interval.

## 6. Handoff Checklist

- Add the incoming chair to `chapter_admins`.
- Confirm the incoming chair can access Supabase dashboard and the deployment platform.
- Rotate any personal credentials still tied to Google Apps Script or Sheets.
- Remove outgoing officers from `chapter_admins` after transition is complete.

## Current Limitation

This patch moves leaderboard reads to Supabase, but the browser admin panel is still using the old local-password model. The next step should be replacing that with Supabase Auth plus server-enforced admin actions.
