-- Namespace every PastMark object with a `pm_` prefix. The Supabase project is
-- shared with other apps (Bronze Atlas, GeoIQ, ...), and generic names like
-- `collections`, `subjects` and `set_updated_at` would collide.
--
-- Renames happen in place, so existing data, foreign keys, RLS policies and
-- triggers are preserved. Function bodies are stored as text, so anything that
-- mentions a table by name is redefined below.
--
-- Older migrations are left untouched: they run before this one on a fresh
-- database and use the original names.

-- ---------------------------------------------------------------------------
-- tables
-- ---------------------------------------------------------------------------

alter table collections rename to pm_collections;
alter table subjects rename to pm_subjects;
alter table subject_collections rename to pm_subject_collections;
alter table subject_images rename to pm_subject_images;
alter table subject_questions rename to pm_subject_questions;
alter table subject_match_items rename to pm_subject_match_items;

-- ---------------------------------------------------------------------------
-- constraints (primary/unique keys also rename their backing indexes)
-- ---------------------------------------------------------------------------

alter table pm_collections rename constraint collections_pkey to pm_collections_pkey;
alter table pm_collections rename constraint collections_slug_key to pm_collections_slug_key;

alter table pm_subjects rename constraint subjects_pkey to pm_subjects_pkey;
alter table pm_subjects rename constraint subjects_slug_key to pm_subjects_slug_key;
alter table pm_subjects rename constraint subjects_external_id_key to pm_subjects_external_id_key;
alter table pm_subjects rename constraint subjects_status_check to pm_subjects_status_check;
alter table pm_subjects rename constraint subjects_subject_type_check to pm_subjects_subject_type_check;
alter table pm_subjects rename constraint subjects_when_precision_check to pm_subjects_when_precision_check;

alter table pm_subject_collections rename constraint subject_collections_pkey to pm_subject_collections_pkey;
alter table pm_subject_collections rename constraint subject_collections_subject_id_fkey to pm_subject_collections_subject_id_fkey;
alter table pm_subject_collections rename constraint subject_collections_collection_id_fkey to pm_subject_collections_collection_id_fkey;

alter table pm_subject_images rename constraint subject_images_pkey to pm_subject_images_pkey;
alter table pm_subject_images rename constraint subject_images_subject_id_fkey to pm_subject_images_subject_id_fkey;

alter table pm_subject_questions rename constraint subject_questions_pkey to pm_subject_questions_pkey;
alter table pm_subject_questions rename constraint subject_questions_subject_id_fkey to pm_subject_questions_subject_id_fkey;
alter table pm_subject_questions rename constraint subject_questions_mechanic_type_check to pm_subject_questions_mechanic_type_check;
alter table pm_subject_questions rename constraint subject_questions_slot_position_check to pm_subject_questions_slot_position_check;
alter table pm_subject_questions rename constraint subject_questions_pair_order_check to pm_subject_questions_pair_order_check;
alter table pm_subject_questions rename constraint subject_questions_slot_requires_selection to pm_subject_questions_slot_requires_selection;
alter table pm_subject_questions rename constraint subject_questions_pair_order_requires_group to pm_subject_questions_pair_order_requires_group;

alter table pm_subject_match_items rename constraint subject_match_items_pkey to pm_subject_match_items_pkey;
alter table pm_subject_match_items rename constraint subject_match_items_subject_id_fkey to pm_subject_match_items_subject_id_fkey;
alter table pm_subject_match_items rename constraint subject_match_items_mode_check to pm_subject_match_items_mode_check;
alter table pm_subject_match_items rename constraint subject_match_items_correct_position_check to pm_subject_match_items_correct_position_check;
alter table pm_subject_match_items rename constraint subject_match_items_mode_shape to pm_subject_match_items_mode_shape;

-- ---------------------------------------------------------------------------
-- standalone indexes
-- ---------------------------------------------------------------------------

alter index subjects_subject_type_idx rename to pm_subjects_subject_type_idx;
alter index subject_collections_collection_id_idx rename to pm_subject_collections_collection_id_idx;
alter index subject_images_subject_id_idx rename to pm_subject_images_subject_id_idx;
alter index subject_questions_subject_id_idx rename to pm_subject_questions_subject_id_idx;
alter index subject_questions_pair_group_id_idx rename to pm_subject_questions_pair_group_id_idx;
alter index subject_questions_selected_slot_unique rename to pm_subject_questions_selected_slot_unique;
alter index subject_match_items_subject_id_idx rename to pm_subject_match_items_subject_id_idx;
alter index subject_match_items_correct_position_unique rename to pm_subject_match_items_correct_position_unique;

-- ---------------------------------------------------------------------------
-- triggers
-- ---------------------------------------------------------------------------

alter trigger collections_set_updated_at on pm_collections rename to pm_collections_set_updated_at;
alter trigger subjects_set_updated_at on pm_subjects rename to pm_subjects_set_updated_at;
alter trigger subjects_enforce_publish_requirements on pm_subjects rename to pm_subjects_enforce_publish_requirements;
alter trigger subject_questions_set_updated_at on pm_subject_questions rename to pm_subject_questions_set_updated_at;

-- The two deferred constraint triggers are recreated below (after their functions)
-- because ALTER TRIGGER ... RENAME leaves the constraint entry behind them
-- under the old name.

-- ---------------------------------------------------------------------------
-- RLS policies
-- ---------------------------------------------------------------------------

alter policy collections_public_read on pm_collections rename to pm_collections_public_read;
alter policy subjects_public_read_published on pm_subjects rename to pm_subjects_public_read_published;
alter policy subject_collections_public_read_published on pm_subject_collections rename to pm_subject_collections_public_read_published;
alter policy subject_images_public_read_published on pm_subject_images rename to pm_subject_images_public_read_published;
alter policy subject_questions_public_read_published on pm_subject_questions rename to pm_subject_questions_public_read_published;
alter policy subject_match_items_public_read_published on pm_subject_match_items rename to pm_subject_match_items_public_read_published;

-- ---------------------------------------------------------------------------
-- functions: rename (triggers follow by reference), then redefine the bodies
-- that mention tables by name
-- ---------------------------------------------------------------------------

alter function set_updated_at() rename to pm_set_updated_at;
alter function enforce_subject_question_pairing() rename to pm_enforce_subject_question_pairing;
alter function enforce_subject_match_items_shape() rename to pm_enforce_subject_match_items_shape;
alter function enforce_subject_publish_requirements() rename to pm_enforce_subject_publish_requirements;
alter function default_when_slider_min_year() rename to pm_default_when_slider_min_year;
alter function default_when_slider_max_year() rename to pm_default_when_slider_max_year;
alter function subject_when_slider_range(uuid) rename to pm_subject_when_slider_range;

create or replace function pm_enforce_subject_question_pairing()
returns trigger
language plpgsql
as $$
declare
  this_row pm_subject_questions%rowtype;
  partner pm_subject_questions%rowtype;
  affected_id uuid;
begin
  affected_id := case when tg_op = 'DELETE' then old.id else new.id end;
  select * into this_row from pm_subject_questions where id = affected_id;

  -- row was deleted and not replaced within the transaction
  if not found then
    return null;
  end if;

  if this_row.pair_group_id is null then
    return null;
  end if;

  select * into partner
    from pm_subject_questions
    where pair_group_id = this_row.pair_group_id
      and id <> this_row.id;

  if not found then
    raise exception 'pair_group_id % has only one row (id %); companion pairs need exactly two',
      this_row.pair_group_id, this_row.id;
  end if;

  if this_row.subject_id <> partner.subject_id then
    raise exception 'paired pm_subject_questions rows % and % must belong to the same subject',
      this_row.id, partner.id;
  end if;

  if this_row.is_selected <> partner.is_selected then
    raise exception 'pair_group_id %: both halves must be selected together (rows % and %)',
      this_row.pair_group_id, this_row.id, partner.id;
  end if;

  if this_row.is_selected and partner.is_selected then
    if this_row.pair_order is null or partner.pair_order is null
       or this_row.pair_order = partner.pair_order then
      raise exception 'pair_group_id %: pair_order must be 1 and 2, one each', this_row.pair_group_id;
    end if;

    if this_row.slot_position is null or partner.slot_position is null
       or abs(this_row.slot_position - partner.slot_position) <> 1 then
      raise exception 'pair_group_id %: paired rows must occupy consecutive slot positions', this_row.pair_group_id;
    end if;

    if (this_row.pair_order < partner.pair_order) <> (this_row.slot_position < partner.slot_position) then
      raise exception 'pair_group_id %: slot order must follow pair_order', this_row.pair_group_id;
    end if;
  end if;

  return null;
end;
$$;

create or replace function pm_enforce_subject_match_items_shape()
returns trigger
language plpgsql
as $$
declare
  target_subject uuid;
  item_count int;
  distinct_modes int;
  chosen_mode text;
  year_spread int;
begin
  target_subject := case when tg_op = 'DELETE' then old.subject_id else new.subject_id end;

  select count(*), count(distinct mode) into item_count, distinct_modes
    from pm_subject_match_items where subject_id = target_subject;

  if item_count = 0 then
    return null;
  end if;

  if distinct_modes > 1 then
    raise exception 'subject % mixes Match & Order modes; a single day uses one mode for all items', target_subject;
  end if;

  if item_count = 4 then
    select mode into chosen_mode from pm_subject_match_items where subject_id = target_subject limit 1;
    select max(year) - min(year) into year_spread
      from pm_subject_match_items where subject_id = target_subject;

    if chosen_mode <> 'order' and year_spread is not null and year_spread < 15 then
      raise exception 'subject % spans fewer than 15 years (%) and must use mode ''order''',
        target_subject, year_spread;
    end if;
  end if;

  return null;
end;
$$;

create or replace function pm_enforce_subject_publish_requirements()
returns trigger
language plpgsql
as $$
declare
  match_item_count int;
  candidate_count int;
  selected_count int;
begin
  if new.status <> 'published' then
    return new;
  end if;

  if tg_op = 'UPDATE' and old.status = 'published' then
    return new;
  end if;

  if new.pin_prompt is null or new.pin_lat is null or new.pin_lon is null or new.pin_label is null then
    raise exception 'subject % cannot publish: Pin is incomplete', new.id;
  end if;

  if new.when_prompt is null or new.when_true_year is null then
    raise exception 'subject % cannot publish: When is incomplete', new.id;
  end if;

  select count(*) into match_item_count from pm_subject_match_items where subject_id = new.id;
  if match_item_count <> 4 then
    raise exception 'subject % cannot publish: Match/Order needs exactly 4 items, found %', new.id, match_item_count;
  end if;

  select count(*), count(*) filter (where is_selected)
    into candidate_count, selected_count
    from pm_subject_questions where subject_id = new.id;

  if candidate_count < 4 then
    raise exception 'subject % cannot publish: needs at least 4 flexible-slot candidates, found %', new.id, candidate_count;
  end if;

  if selected_count <> 4 then
    raise exception 'subject % cannot publish: exactly 4 flexible-slot candidates must be selected (slots 3-6), found %', new.id, selected_count;
  end if;

  return new;
end;
$$;

create or replace function pm_default_when_slider_min_year()
returns int
language sql
stable
as $$
  select (
    least(
      (select min(when_true_year) from pm_subjects),
      (select min(year) from pm_subject_match_items)
    ) - 100
  )::int;
$$;

create or replace function pm_subject_when_slider_range(p_subject_id uuid)
returns table (min_year int, max_year int)
language sql
stable
as $$
  select
    coalesce(s.when_min_year, pm_default_when_slider_min_year()),
    coalesce(s.when_max_year, pm_default_when_slider_max_year())
  from pm_subjects s
  where s.id = p_subject_id;
$$;

-- Recreate the deferred constraint triggers under prefixed names.
drop trigger subject_questions_pairing_check on pm_subject_questions;
create constraint trigger pm_subject_questions_pairing_check
  after insert or update or delete on pm_subject_questions
  deferrable initially deferred
  for each row execute function pm_enforce_subject_question_pairing();

drop trigger subject_match_items_shape_check on pm_subject_match_items;
create constraint trigger pm_subject_match_items_shape_check
  after insert or update or delete on pm_subject_match_items
  deferrable initially deferred
  for each row execute function pm_enforce_subject_match_items_shape();
