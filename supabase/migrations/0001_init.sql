-- TA Auto Content Dashboard — initial schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type pillar as enum ('vlog', 'showcase', 'conversion');
create type production_level as enum ('quick_capture', 'planned_shoot', 'higgsfield_enhanced');
create type content_status as enum ('idea', 'scripted', 'to_film', 'filmed', 'editing', 'ready', 'posted');
create type platform as enum ('tiktok', 'instagram', 'facebook');
create type priority_level as enum ('low', 'medium', 'high');

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- content_items
-- ---------------------------------------------------------------------------

create table content_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  pillar pillar not null,
  segment text,
  platforms text[] not null default '{}',
  production_level production_level not null default 'quick_capture',
  status content_status not null default 'idea',
  scheduled_post_date date,
  filming_date date,
  week_number int check (week_number between 1 and 53),
  year int check (year between 2020 and 2100),
  script text,
  shot_list jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger content_items_set_updated_at
  before update on content_items
  for each row execute function set_updated_at();

-- The planner queries almost exclusively by (year, week_number).
create index content_items_week_idx on content_items (year, week_number);
create index content_items_status_idx on content_items (status);
create index content_items_filming_date_idx on content_items (filming_date);

-- ---------------------------------------------------------------------------
-- content_bank
-- ---------------------------------------------------------------------------

create table content_bank (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  pillar pillar not null,
  description text,
  priority priority_level not null default 'medium',
  promoted_to_item_id uuid references content_items (id) on delete set null,
  created_at timestamptz not null default now()
);

create index content_bank_pillar_idx on content_bank (pillar);
create index content_bank_promoted_idx on content_bank (promoted_to_item_id);

-- ---------------------------------------------------------------------------
-- metrics
-- ---------------------------------------------------------------------------

create table metrics (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references content_items (id) on delete cascade,
  platform platform not null,
  views int not null default 0,
  likes int not null default 0,
  comments int not null default 0,
  shares int,
  saves int,
  logged_at timestamptz not null default now()
);

create index metrics_content_item_idx on metrics (content_item_id);

-- One metrics row per item per platform: logging again updates in place.
create unique index metrics_item_platform_idx on metrics (content_item_id, platform);

-- ---------------------------------------------------------------------------
-- segments
-- ---------------------------------------------------------------------------

create table segments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  active boolean not null default true
);

insert into segments (name, description) values
  ('New Arrival Reveal',       'First look at a car landing on the floor.'),
  ('Behind the Deal',          'The negotiation, the handover, the story behind a sale.'),
  ('Detailing Transformation', 'Before/after with the detailing team.'),
  ('Mistake of the Week',      'Something that went wrong — owned honestly.'),
  ('Scam of the Week',         'Buyer-education piece on a scam or bad-car red flag.'),
  ('Client Story',             'A customer and the car they drove away in.'),
  ('Team Talk',                'Amer, Kenan, Andreas — opinions, banter, hot takes.');

-- ---------------------------------------------------------------------------
-- settings — single-row config table (on-site days for the filming card)
-- ---------------------------------------------------------------------------

create table settings (
  id boolean primary key default true check (id),
  -- ISO weekday numbers: 1 = Monday ... 7 = Sunday
  on_site_days int[] not null default '{1,3,5}',
  weekly_target int not null default 5,
  updated_at timestamptz not null default now()
);

create trigger settings_set_updated_at
  before update on settings
  for each row execute function set_updated_at();

insert into settings (id) values (true);

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- v1 has no auth: the app talks to Postgres with the anon key, so anon needs
-- full access. This means anyone holding the anon key (it ships to the browser)
-- can read and write every row. Acceptable only because the URL is unpublished
-- and the data is non-sensitive. Replace these policies with auth.uid()-scoped
-- ones before this holds anything that matters.
-- ---------------------------------------------------------------------------

alter table content_items enable row level security;
alter table content_bank  enable row level security;
alter table metrics       enable row level security;
alter table segments      enable row level security;
alter table settings      enable row level security;

create policy anon_all_content_items on content_items for all to anon using (true) with check (true);
create policy anon_all_content_bank  on content_bank  for all to anon using (true) with check (true);
create policy anon_all_metrics       on metrics       for all to anon using (true) with check (true);
create policy anon_all_segments      on segments      for all to anon using (true) with check (true);
create policy anon_all_settings      on settings      for all to anon using (true) with check (true);
