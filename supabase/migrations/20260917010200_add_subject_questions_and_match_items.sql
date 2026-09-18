-- Flexible-slot question pool and the shared Mark 7 (Match & Order) content
-- table, per docs/pastmark-person-event-spec.md.
--
-- `subject_questions` absorbs what would otherwise be flat `era`,
-- `succession`, `know_1..3` columns on `subjects` into one extensible,
-- queryable shape (Marks 3-6, the flexible slots).
--
-- `subject_match_items` is the widened/renamed replacement for the
-- originally-planned `match_pairs` table and holds Mark 7 content for all
-- four content modes (`subject_to_year`, `subject_to_place`,
-- `subject_to_event`, `order`).

-- ---------------------------------------------------------------------------
-- subject_questions
-- ---------------------------------------------------------------------------

create table subject_questions (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references subjects (id) on delete cascade,
  mechanic_type text not null check (mechanic_type in (
    'know', 'see', 'era', 'succession', 'nickname', 'language',
    'flag', 'flag_meaning', 'current_country', 'legacy',
    'world_firsts', 'contemporaries', 'relationships'
  )),
  prompt text not null,
  correct_answer text not null, -- or a subject_images.id (as text) when mechanic_type = 'see'
  distractors text[] not null default '{}',
  is_selected boolean not null default false,
  slot_position smallint check (slot_position between 3 and 6),
  pair_group_id uuid,
  pair_order smallint check (pair_order in (1, 2)),
  notes text, -- research citation / authoring rationale, never shown to players
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint subject_questions_slot_requires_selection
    check (slot_position is null or is_selected),
  constraint subject_questions_pair_order_requires_group
    check (pair_order is null or pair_group_id is not null)
);

create index subject_questions_subject_id_idx on subject_questions (subject_id);
create index subject_questions_pair_group_id_idx
  on subject_questions (pair_group_id)
  where pair_group_id is not null;

-- exactly one selected candidate per flexible slot position, per subject
create unique index subject_questions_selected_slot_unique
  on subject_questions (subject_id, slot_position)
  where is_selected and slot_position is not null;

create trigger subject_questions_set_updated_at
  before update on subject_questions
  for each row execute function set_updated_at();

-- Companion pairs: selecting one half requires selecting the other, and a
-- selected pair must occupy consecutive slot_positions ordered by
-- pair_order. Deferred so both halves can be written in one transaction.
create or replace function enforce_subject_question_pairing()
returns trigger
language plpgsql
as $$
declare
  this_row subject_questions%rowtype;
  partner subject_questions%rowtype;
  affected_id uuid;
begin
  affected_id := case when tg_op = 'DELETE' then old.id else new.id end;
  select * into this_row from subject_questions where id = affected_id;

  -- row was deleted and not replaced within the transaction
  if not found then
    return null;
  end if;

  if this_row.pair_group_id is null then
    return null;
  end if;

  select * into partner
    from subject_questions
    where pair_group_id = this_row.pair_group_id
      and id <> this_row.id;

  if not found then
    raise exception 'pair_group_id % has only one row (id %); companion pairs need exactly two',
      this_row.pair_group_id, this_row.id;
  end if;

  if this_row.subject_id <> partner.subject_id then
    raise exception 'paired subject_questions rows % and % must belong to the same subject',
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

create constraint trigger subject_questions_pairing_check
  after insert or update or delete on subject_questions
  deferrable initially deferred
  for each row execute function enforce_subject_question_pairing();

-- ---------------------------------------------------------------------------
-- subject_match_items — Mark 7 (Match & Order), all four content modes.
--
-- Every item is fundamentally a {label, place, year} life-event-style triple
-- (per the Person spec's life-events model, generalized to every subject
-- type) — `place` and `year` are always populated regardless of `mode`;
-- `mode` just picks which fact the player is quizzed on (or uses ordering).
-- `related_fact` and `correct_position` are the two mode-specific
-- exceptions, only required for 'subject_to_event' and 'order' respectively.
--
-- Years are plain integers with simple negation for BCE (30 BCE = -30, not
-- astronomical year numbering where 30 BCE would be -29).
-- ---------------------------------------------------------------------------

create table subject_match_items (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references subjects (id) on delete cascade,
  mode text not null check (mode in ('subject_to_year', 'subject_to_place', 'subject_to_event', 'order')),
  item_label text not null,
  place text not null,
  year int not null,
  related_fact text, -- required when mode = 'subject_to_event'
  correct_position smallint check (correct_position between 1 and 4), -- required + unique when mode = 'order'
  sort_order smallint not null default 0,
  notes text, -- research citation and/or a finer display date, never shown pre-answer
  created_at timestamptz not null default now(),

  constraint subject_match_items_mode_shape check (
    (mode != 'subject_to_event' or related_fact is not null)
    and (mode != 'order' or correct_position is not null)
  )
);

create index subject_match_items_subject_id_idx on subject_match_items (subject_id);

create unique index subject_match_items_correct_position_unique
  on subject_match_items (subject_id, correct_position)
  where correct_position is not null;

-- A day's Mark 7 uses one mode for all of its items, and (once complete)
-- exactly 4 items. Below 15 years' spread, the firm authoring rule requires
-- 'order'. Deferred so all 4 rows can be written in one transaction.
create or replace function enforce_subject_match_items_shape()
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
    from subject_match_items where subject_id = target_subject;

  if item_count = 0 then
    return null;
  end if;

  if distinct_modes > 1 then
    raise exception 'subject % mixes Match & Order modes; a single day uses one mode for all items', target_subject;
  end if;

  if item_count = 4 then
    select mode into chosen_mode from subject_match_items where subject_id = target_subject limit 1;
    select max(year) - min(year) into year_spread
      from subject_match_items where subject_id = target_subject;

    if chosen_mode <> 'order' and year_spread is not null and year_spread < 15 then
      raise exception 'subject % spans fewer than 15 years (%) and must use mode ''order''',
        target_subject, year_spread;
    end if;
  end if;

  return null;
end;
$$;

create constraint trigger subject_match_items_shape_check
  after insert or update or delete on subject_match_items
  deferrable initially deferred
  for each row execute function enforce_subject_match_items_shape();

-- ---------------------------------------------------------------------------
-- Publish-time validation on subjects
-- ---------------------------------------------------------------------------

create or replace function enforce_subject_publish_requirements()
returns trigger
language plpgsql
as $$
declare
  match_item_count int;
  candidate_count int;
  selected_count int;
begin
  if new.status <> 'published' or old.status = 'published' then
    return new;
  end if;

  if new.pin_prompt is null or new.pin_lat is null or new.pin_lon is null or new.pin_label is null then
    raise exception 'subject % cannot publish: Pin is incomplete', new.id;
  end if;

  if new.when_prompt is null or new.when_true_year is null then
    raise exception 'subject % cannot publish: When is incomplete', new.id;
  end if;

  select count(*) into match_item_count from subject_match_items where subject_id = new.id;
  if match_item_count <> 4 then
    raise exception 'subject % cannot publish: Match/Order needs exactly 4 items, found %', new.id, match_item_count;
  end if;

  select count(*), count(*) filter (where is_selected)
    into candidate_count, selected_count
    from subject_questions where subject_id = new.id;

  if candidate_count < 4 then
    raise exception 'subject % cannot publish: needs at least 4 flexible-slot candidates, found %', new.id, candidate_count;
  end if;

  if selected_count <> 4 then
    raise exception 'subject % cannot publish: exactly 4 flexible-slot candidates must be selected (slots 3-6), found %', new.id, selected_count;
  end if;

  return new;
end;
$$;

create trigger subjects_enforce_publish_requirements
  before update on subjects
  for each row execute function enforce_subject_publish_requirements();
