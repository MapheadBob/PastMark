-- Captures database objects that already exist in the live Supabase project but
-- were created outside this repo (the round-based map game: profiles, badges,
-- daily challenges, round results/targets, and the leaderboard).
--
-- This was reconstructed from the live database (columns, constraints, indexes,
-- policies, functions, trigger, materialized view, cron job), not authored
-- fresh. It is written to be idempotent so it is a no-op where the objects
-- already exist. On the live project it should be marked as applied rather than
-- run:  supabase migration repair --status applied 20260918030000
--
-- Not captured: the platform-managed event triggers (ensure_rls, pgrst_*,
-- issue_*) and the rls_auto_enable() function behind ensure_rls, which Supabase
-- manages at the project level.

create extension if not exists pg_cron;

-- ---------------------------------------------------------------------------
-- tables
-- ---------------------------------------------------------------------------

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  region text,
  username text,
  avatar_url text
);

create table if not exists badges (
  user_id uuid not null references profiles (id) on delete cascade,
  badge_id text not null,
  awarded_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

create table if not exists daily_challenges (
  challenge_date date primary key,
  target_ids text[] not null,
  city_count integer generated always as (array_length(target_ids, 1)) stored,
  created_at timestamptz not null default now()
);

create table if not exists round_targets (
  id text primary key,
  category text not null,
  name text not null,
  country text,
  continent text not null,
  difficulty text not null,
  calibrated_easy boolean not null default false,
  latitude double precision not null,
  longitude double precision not null,
  prompt text not null,
  did_you_know_fact text,
  metadata jsonb not null default '{}'::jsonb,
  source_file text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint round_targets_difficulty_check check (difficulty = any (array['easy', 'medium', 'hard'])),
  constraint round_targets_latitude_check check (latitude >= -90 and latitude <= 90),
  constraint round_targets_longitude_check check (longitude >= -180 and longitude <= 180)
);

create table if not exists round_results (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles (id) on delete cascade,
  guest_session_id text not null,
  round_index integer not null,
  target_id text not null,
  target_name text not null,
  guess_lat double precision not null,
  guess_lng double precision not null,
  target_lat double precision not null,
  target_lng double precision not null,
  distance_km double precision not null,
  points integer not null,
  accuracy_pct integer not null,
  played_at timestamptz not null,
  created_at timestamptz not null default now(),
  distance_score integer,
  time_score integer,
  constraint round_results_guest_session_id_round_index_key unique (guest_session_id, round_index),
  constraint round_results_accuracy_pct_check check (accuracy_pct >= 0 and accuracy_pct <= 100),
  constraint round_results_points_check check (points >= 0 and points <= 1000),
  constraint round_results_distance_score_range check (distance_score is null or (distance_score >= 0 and distance_score <= 800)),
  constraint round_results_time_score_range check (time_score is null or (time_score >= 0 and time_score <= 200))
);

comment on table daily_challenges is $comment$One row per UTC day: the fixed set of RoundTarget ids every player sees for that day's Daily Global Challenge (§5.4 "everyone plays the same board"). Populated by a scheduled job (see 0003 migration comments) or, for local/dev, derived on the fly by lib/game/session.ts's seeded shuffle keyed on the date.$comment$;

-- ---------------------------------------------------------------------------
-- indexes
-- ---------------------------------------------------------------------------

create index if not exists idx_profiles_region on profiles (region) where region is not null;
create index if not exists round_results_user_id_idx on round_results (user_id);
create index if not exists round_targets_category_idx on round_targets (category);
create index if not exists round_targets_continent_idx on round_targets (continent);
create index if not exists round_targets_difficulty_idx on round_targets (difficulty);

-- ---------------------------------------------------------------------------
-- leaderboard materialized view (must exist before the functions that read it)
-- ---------------------------------------------------------------------------

create materialized view if not exists leaderboard_totals_mv as
 WITH bounds AS (
         SELECT date_trunc('week'::text, now()) AS week_start,
            date_trunc('month'::text, now()) AS month_start
        ), per_window AS (
         SELECT p.id AS user_id,
            p.username,
            p.avatar_url,
            p.region,
            'weekly'::text AS time_window,
            sum(rr.points) AS total_score,
            count(*) AS rounds_played
           FROM ((round_results rr
             JOIN profiles p ON ((p.id = rr.user_id)))
             CROSS JOIN bounds b)
          WHERE ((rr.user_id IS NOT NULL) AND (rr.played_at >= b.week_start))
          GROUP BY p.id, p.username, p.avatar_url, p.region
        UNION ALL
         SELECT p.id,
            p.username,
            p.avatar_url,
            p.region,
            'monthly'::text,
            sum(rr.points) AS sum,
            count(*) AS count
           FROM ((round_results rr
             JOIN profiles p ON ((p.id = rr.user_id)))
             CROSS JOIN bounds b)
          WHERE ((rr.user_id IS NOT NULL) AND (rr.played_at >= b.month_start))
          GROUP BY p.id, p.username, p.avatar_url, p.region
        UNION ALL
         SELECT p.id,
            p.username,
            p.avatar_url,
            p.region,
            'all_time'::text,
            sum(rr.points) AS sum,
            count(*) AS count
           FROM (round_results rr
             JOIN profiles p ON ((p.id = rr.user_id)))
          WHERE (rr.user_id IS NOT NULL)
          GROUP BY p.id, p.username, p.avatar_url, p.region
        )
 SELECT user_id,
    username,
    avatar_url,
    region,
    time_window,
    (total_score)::integer AS total_score,
    (rounds_played)::integer AS rounds_played,
    now() AS refreshed_at
   FROM per_window;

create unique index if not exists idx_leaderboard_totals_mv_user_window
  on leaderboard_totals_mv (user_id, time_window);
create index if not exists idx_leaderboard_totals_mv_window_region_score
  on leaderboard_totals_mv (time_window, region, total_score desc);

-- ---------------------------------------------------------------------------
-- functions
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_guest_rank(p_score integer, p_window text)
 RETURNS TABLE(rank integer, total_players integer)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select
    (
      (select count(*) from public.leaderboard_totals_mv where time_window = p_window and total_score > p_score)::integer + 1
    ) as rank,
    (select count(*) from public.leaderboard_totals_mv where time_window = p_window)::integer as total_players;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.refresh_leaderboard_totals()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  refresh materialized view concurrently public.leaderboard_totals_mv;
end;
$function$;

CREATE OR REPLACE FUNCTION public.get_leaderboard_page(p_scope text, p_window text, p_viewer_id uuid, p_limit integer DEFAULT 50, p_after_rank integer DEFAULT 0)
 RETURNS TABLE(rank integer, user_id uuid, username text, avatar_url text, score integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_region text;
begin
  if p_scope = 'friends' then
    raise exception 'friends_scope_not_implemented' using hint = 'Deferred to P2 pending a social graph — Requirements §7.3/§8.';
  end if;

  if p_scope not in ('global', 'regional') then
    raise exception 'invalid_scope: %', p_scope;
  end if;

  if p_window not in ('weekly', 'monthly', 'all_time') then
    raise exception 'invalid_window: %', p_window;
  end if;

  if p_scope = 'regional' then
    select region into v_region from public.profiles where id = p_viewer_id;
  end if;

  return query
  with ranked as (
    select
      row_number() over (order by lt.total_score desc, lt.user_id) as rank,
      lt.user_id, lt.username, lt.avatar_url, lt.total_score as score
    from public.leaderboard_totals_mv lt
    where lt.time_window = p_window
      and (p_scope = 'global' or lt.region is not distinct from v_region)
  )
  select r.rank::integer, r.user_id, r.username, r.avatar_url, r.score::integer
  from ranked r
  where r.rank > p_after_rank
  order by r.rank
  limit p_limit;
end;
$function$;

CREATE OR REPLACE FUNCTION public.get_rank(p_user_id uuid, p_scope text, p_window text)
 RETURNS TABLE(rank integer, total_players integer, score integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_region text;
begin
  if p_scope = 'friends' then
    raise exception 'friends_scope_not_implemented' using hint = 'Deferred to P2 — Requirements §7.3/§8.';
  end if;

  if p_scope = 'regional' then
    select region into v_region from public.profiles where id = p_user_id;
  end if;

  return query
  with scoped as (
    select lt.user_id, lt.total_score
    from public.leaderboard_totals_mv lt
    where lt.time_window = p_window
      and (p_scope = 'global' or lt.region is not distinct from v_region)
  ),
  ranked as (
    select user_id, row_number() over (order by total_score desc, user_id) as rank
    from scoped
  )
  select
    coalesce((select r.rank from ranked r where r.user_id = p_user_id), 0)::integer,
    (select count(*) from scoped)::integer,
    coalesce((select total_score from scoped where user_id = p_user_id), 0)::integer;
end;
$function$;

-- ---------------------------------------------------------------------------
-- new-user trigger: every auth user gets a profile row
-- ---------------------------------------------------------------------------

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- row level security
-- ---------------------------------------------------------------------------

alter table profiles enable row level security;
alter table badges enable row level security;
alter table daily_challenges enable row level security;
alter table round_targets enable row level security;
alter table round_results enable row level security;

drop policy if exists "profiles are self-readable" on profiles;
create policy "profiles are self-readable" on profiles
  for select using (auth.uid() = id);

drop policy if exists "badges are self-readable" on badges;
create policy "badges are self-readable" on badges
  for select using (auth.uid() = user_id);

drop policy if exists "badges are self-writable" on badges;
create policy "badges are self-writable" on badges
  for insert with check (auth.uid() = user_id);

drop policy if exists "daily_challenges_select_all" on daily_challenges;
create policy "daily_challenges_select_all" on daily_challenges
  for select using (true);

drop policy if exists "round_targets_select_all" on round_targets;
create policy "round_targets_select_all" on round_targets
  for select to anon, authenticated using (true);

drop policy if exists "round_results are self-readable" on round_results;
create policy "round_results are self-readable" on round_results
  for select using (auth.uid() = user_id);

drop policy if exists "round_results are self-writable" on round_results;
create policy "round_results are self-writable" on round_results
  for insert with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- scheduled leaderboard refresh (every 10 minutes)
-- ---------------------------------------------------------------------------

select cron.schedule('refresh_leaderboard_totals', '*/10 * * * *', 'select public.refresh_leaderboard_totals();');
