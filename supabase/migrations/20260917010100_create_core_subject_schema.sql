-- Core Subject schema: collections, subjects, and the join/asset tables that
-- support them. Pin and When ship as direct columns on `subjects` because
-- they are fixed anchors on every Subject regardless of type. See
-- docs/pastmark-person-event-spec.md ("Data Architecture") for the full
-- rationale behind the single-`subjects`-table decision.

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
-- collections
-- ---------------------------------------------------------------------------

create table collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger collections_set_updated_at
  before update on collections
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- subjects — one row per Subject Pack, for any of the three subject types.
-- `subject_type` is the addition this spec calls for (Location shipped
-- first without it). The Know/See/Era/Succession/bonus-category MC
-- *questions* (prompt + distractors) are NOT columns here — they live in
-- `subject_questions` as flexible-slot candidates (see the next migration).
-- The `_note`/`_fact` columns below are narrative color an author draws on
-- to write those questions, not the questions themselves.
-- ---------------------------------------------------------------------------

create table subjects (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null check (subject_type in ('location', 'person', 'event')),
  slug text not null unique,
  name text not null,
  short_description text,
  status text not null default 'draft' check (status in ('draft', 'published')),

  -- Mark 1: Pin (fixed anchor)
  pin_prompt text,
  pin_lat double precision,
  pin_lon double precision,
  pin_label text,
  pin_reveal_fact text,
  pin_commentary_positive text,
  pin_commentary_negative text,

  -- Mark 2: When (fixed anchor)
  when_label text,
  when_prompt text,
  when_date_display text,
  when_min_year int,
  when_max_year int,
  when_true_year int,
  when_precision text check (when_precision in ('year', 'month', 'day')),
  when_tags text[] not null default '{}',
  when_reveal_fact text,
  when_commentary_positive text,
  when_commentary_negative text,

  -- Editorial rationale for the Mark 7 (Match/Order) mode chosen for this
  -- subject; the anchor content itself lives in subject_match_items.
  match_order_rationale text,

  -- Narrative facts backing the flexible-slot Know/Era/Succession marks.
  -- These are supporting color an author drew on, not the interactive
  -- question itself — that lives in subject_questions (mechanic_type
  -- 'era'/'succession'/'know'/...) with its own prompt + distractors.
  era_note text,
  succession_note text,
  know_fact_1 text,
  know_fact_2 text,

  -- Geography/classification metadata. Originally Location-only; the
  -- content team generalized it to Person and Event subjects too.
  country_region text,
  continent text,

  -- Editorial/content-ops metadata, never shown to players.
  sensitivity_note text,
  source_notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subjects_subject_type_idx on subjects (subject_type);

create trigger subjects_set_updated_at
  before update on subjects
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- subject_collections — join table; unchanged by this spec, already works
-- across any subject_type value.
-- ---------------------------------------------------------------------------

create table subject_collections (
  subject_id uuid not null references subjects (id) on delete cascade,
  collection_id uuid not null references collections (id) on delete cascade,
  primary key (subject_id, collection_id)
);

create index subject_collections_collection_id_idx on subject_collections (collection_id);

-- ---------------------------------------------------------------------------
-- subject_images — image assets backing See marks and 'see'-type flexible
-- questions. `subject_questions.correct_answer` references a row here (by
-- id, as text) when mechanic_type = 'see'.
-- ---------------------------------------------------------------------------

create table subject_images (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references subjects (id) on delete cascade,
  storage_path text not null,
  caption text,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);

create index subject_images_subject_id_idx on subject_images (subject_id);
