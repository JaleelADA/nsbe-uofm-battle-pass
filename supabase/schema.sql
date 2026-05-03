create extension if not exists pgcrypto;

create table if not exists public.chapter_admins (
  email text primary key,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

create table if not exists public.members (
  uniqname text primary key,
  email text unique not null,
  display_name text not null,
  major text,
  year text,
  is_paid boolean not null default false,
  national_dues text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.attendance_logs (
  id uuid primary key default gen_random_uuid(),
  uniqname text not null references public.members(uniqname) on update cascade on delete cascade,
  email text,
  full_name text,
  event_name text not null,
  event_category text not null,
  attended_at timestamptz not null,
  brought_friend boolean not null default false,
  friend_count integer not null default 0 check (friend_count >= 0),
  major text,
  year text,
  paid_national_dues text,
  source text not null default 'manual',
  created_at timestamptz not null default now()
);

create index if not exists attendance_logs_uniqname_idx on public.attendance_logs (uniqname);
create index if not exists attendance_logs_attended_at_idx on public.attendance_logs (attended_at desc);

alter table public.chapter_admins enable row level security;
alter table public.members enable row level security;
alter table public.attendance_logs enable row level security;

drop policy if exists "public read members" on public.members;
create policy "public read members"
on public.members
for select
using (true);

drop policy if exists "public read attendance_logs" on public.attendance_logs;
create policy "public read attendance_logs"
on public.attendance_logs
for select
using (true);

drop policy if exists "chapter admins read chapter_admins" on public.chapter_admins;
create policy "chapter admins read chapter_admins"
on public.chapter_admins
for select
to authenticated
using (
  exists (
    select 1
    from public.chapter_admins admins
    where lower(admins.email) = lower(auth.jwt() ->> 'email')
  )
);

drop policy if exists "chapter admins manage members" on public.members;
create policy "chapter admins manage members"
on public.members
for all
to authenticated
using (
  exists (
    select 1
    from public.chapter_admins admins
    where lower(admins.email) = lower(auth.jwt() ->> 'email')
  )
)
with check (
  exists (
    select 1
    from public.chapter_admins admins
    where lower(admins.email) = lower(auth.jwt() ->> 'email')
  )
);

drop policy if exists "chapter admins manage attendance_logs" on public.attendance_logs;
create policy "chapter admins manage attendance_logs"
on public.attendance_logs
for all
to authenticated
using (
  exists (
    select 1
    from public.chapter_admins admins
    where lower(admins.email) = lower(auth.jwt() ->> 'email')
  )
)
with check (
  exists (
    select 1
    from public.chapter_admins admins
    where lower(admins.email) = lower(auth.jwt() ->> 'email')
  )
);
