-- Space Industry Hub: Supabase schema.
-- Run this once in the Supabase SQL Editor of the new project.
-- Each table stores one document per row in a jsonb "doc" column, so the
-- Supabase dashboard doubles as a simple content editor.

create table if not exists public.companies (
  slug text primary key,
  doc jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  slug text primary key,
  doc jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.sources (
  video_id text primary key,
  doc jsonb not null,
  updated_at timestamptz not null default now()
);

-- Public read-only access (the site uses the anon key; writes happen only
-- from the dashboard / service role).
alter table public.companies enable row level security;
alter table public.vehicles enable row level security;
alter table public.sources enable row level security;

drop policy if exists "public read companies" on public.companies;
create policy "public read companies" on public.companies for select using (true);

drop policy if exists "public read vehicles" on public.vehicles;
create policy "public read vehicles" on public.vehicles for select using (true);

drop policy if exists "public read sources" on public.sources;
create policy "public read sources" on public.sources for select using (true);

-- per-user watched-video tracking (requires Supabase Auth)
create table if not exists public.watched_videos (
  user_id uuid not null default auth.uid(),
  video_id text not null,
  watched_at timestamptz not null default now(),
  primary key (user_id, video_id)
);

alter table public.watched_videos enable row level security;

drop policy if exists "own rows select" on public.watched_videos;
create policy "own rows select" on public.watched_videos for select using (auth.uid() = user_id);

drop policy if exists "own rows insert" on public.watched_videos;
create policy "own rows insert" on public.watched_videos for insert with check (auth.uid() = user_id);

drop policy if exists "own rows delete" on public.watched_videos;
create policy "own rows delete" on public.watched_videos for delete using (auth.uid() = user_id);
