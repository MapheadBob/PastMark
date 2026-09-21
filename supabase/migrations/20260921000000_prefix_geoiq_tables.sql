-- Namespace GeoIQ's database objects with a `gi_` prefix. The Supabase project is
-- shared by several apps (Bronze Atlas, GeoIQ, PastMark, ...), and the PastMark
-- objects already carry `pm_`.
--
-- Deliberately NOT renamed, because they are shared platform objects rather than
-- GeoIQ's: `profiles` (and idx_profiles_region), `handle_new_user()` and the
-- `on_auth_user_created` trigger on auth.users, and Supabase's own
-- `rls_auto_enable()`.
--
-- Renames happen in place, so data, foreign keys, RLS policies, grants and the
-- materialized view's definition are preserved. Function bodies and the cron
-- command are stored as text, so anything naming a renamed object is redefined.
--
-- BREAKING for any client that names these objects: supabase-js calls such as
-- .from('round_results') and .rpc('get_rank', ...) must move to the gi_ names.

-- ---------------------------------------------------------------------------
-- tables
-- ---------------------------------------------------------------------------

alter table badges rename to gi_badges;
alter table daily_challenges rename to gi_daily_challenges;
alter table round_targets rename to gi_round_targets;
alter table round_results rename to gi_round_results;

alter sequence round_results_id_seq rename to gi_round_results_id_seq;

-- ---------------------------------------------------------------------------
-- constraints (primary/unique keys also rename their backing indexes)
-- ---------------------------------------------------------------------------

alter table gi_badges rename constraint badges_pkey to gi_badges_pkey;
alter table gi_badges rename constraint badges_user_id_fkey to gi_badges_user_id_fkey;

alter table gi_daily_challenges rename constraint daily_challenges_pkey to gi_daily_challenges_pkey;

alter table gi_round_targets rename constraint round_targets_pkey to gi_round_targets_pkey;
alter table gi_round_targets rename constraint round_targets_difficulty_check to gi_round_targets_difficulty_check;
alter table gi_round_targets rename constraint round_targets_latitude_check to gi_round_targets_latitude_check;
alter table gi_round_targets rename constraint round_targets_longitude_check to gi_round_targets_longitude_check;

alter table gi_round_results rename constraint round_results_pkey to gi_round_results_pkey;
alter table gi_round_results rename constraint round_results_user_id_fkey to gi_round_results_user_id_fkey;
alter table gi_round_results rename constraint round_results_guest_session_id_round_index_key to gi_round_results_guest_session_id_round_index_key;
alter table gi_round_results rename constraint round_results_accuracy_pct_check to gi_round_results_accuracy_pct_check;
alter table gi_round_results rename constraint round_results_points_check to gi_round_results_points_check;
alter table gi_round_results rename constraint round_results_distance_score_range to gi_round_results_distance_score_range;
alter table gi_round_results rename constraint round_results_time_score_range to gi_round_results_time_score_range;

-- ---------------------------------------------------------------------------
-- standalone indexes
-- ---------------------------------------------------------------------------

alter index round_results_user_id_idx rename to gi_round_results_user_id_idx;
alter index round_targets_category_idx rename to gi_round_targets_category_idx;
alter index round_targets_continent_idx rename to gi_round_targets_continent_idx;
alter index round_targets_difficulty_idx rename to gi_round_targets_difficulty_idx;

-- ---------------------------------------------------------------------------
-- leaderboard materialized view and its indexes
-- ---------------------------------------------------------------------------

alter materialized view leaderboard_totals_mv rename to gi_leaderboard_totals_mv;
alter index idx_leaderboard_totals_mv_user_window rename to idx_gi_leaderboard_totals_mv_user_window;
alter index idx_leaderboard_totals_mv_window_region_score rename to idx_gi_leaderboard_totals_mv_window_region_score;

-- ---------------------------------------------------------------------------
-- RLS policies
-- ---------------------------------------------------------------------------

alter policy "badges are self-readable" on gi_badges rename to "gi_badges are self-readable";
alter policy "badges are self-writable" on gi_badges rename to "gi_badges are self-writable";
alter policy daily_challenges_select_all on gi_daily_challenges rename to gi_daily_challenges_select_all;
alter policy round_targets_select_all on gi_round_targets rename to gi_round_targets_select_all;
alter policy "round_results are self-readable" on gi_round_results rename to "gi_round_results are self-readable";
alter policy "round_results are self-writable" on gi_round_results rename to "gi_round_results are self-writable";

-- ---------------------------------------------------------------------------
-- functions: rename, then redefine the bodies that name the materialized view
-- (arguments and return types are unchanged, so RPC callers only change the name)
-- ---------------------------------------------------------------------------

alter function get_guest_rank(integer, text) rename to gi_get_guest_rank;
alter function get_leaderboard_page(text, text, uuid, integer, integer) rename to gi_get_leaderboard_page;
alter function get_rank(uuid, text, text) rename to gi_get_rank;
alter function refresh_leaderboard_totals() rename to gi_refresh_leaderboard_totals;

create or replace function public.gi_get_guest_rank(p_score integer, p_window text)
 returns table(rank integer, total_players integer)
 language sql
 security definer
 set search_path to 'public'
as $function$
  select
    (
      (select count(*) from public.gi_leaderboard_totals_mv where time_window = p_window and total_score > p_score)::integer + 1
    ) as rank,
    (select count(*) from public.gi_leaderboard_totals_mv where time_window = p_window)::integer as total_players;
$function$;

create or replace function public.gi_refresh_leaderboard_totals()
 returns void
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
begin
  refresh materialized view concurrently public.gi_leaderboard_totals_mv;
end;
$function$;

create or replace function public.gi_get_leaderboard_page(p_scope text, p_window text, p_viewer_id uuid, p_limit integer default 50, p_after_rank integer default 0)
 returns table(rank integer, user_id uuid, username text, avatar_url text, score integer)
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
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
    from public.gi_leaderboard_totals_mv lt
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

create or replace function public.gi_get_rank(p_user_id uuid, p_scope text, p_window text)
 returns table(rank integer, total_players integer, score integer)
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
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
    from public.gi_leaderboard_totals_mv lt
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
-- scheduled leaderboard refresh: the job runs a stored command string that names
-- the old function, so replace the job rather than rename it
-- ---------------------------------------------------------------------------

do $$
begin
  if exists (select 1 from cron.job where jobname = 'refresh_leaderboard_totals') then
    perform cron.unschedule('refresh_leaderboard_totals');
  end if;
end;
$$;

select cron.schedule('gi_refresh_leaderboard_totals', '*/10 * * * *', 'select public.gi_refresh_leaderboard_totals();');
