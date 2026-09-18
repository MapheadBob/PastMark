-- Resolves the open question from docs/pastmark-subject-content-schema-update.md:
-- the content workbook never authors a per-subject when_min_year/when_max_year
-- slider range. Decision: those columns become an optional per-subject
-- override (NULL = "use the computed default"), and the default range is
-- computed live as (100 years before the oldest year fact anywhere in the
-- corpus) through (the current year) -- not a static authored value, since
-- both ends move as content is added and time passes.
--
-- "Oldest year fact" is taken across every year-bearing field in the
-- content -- subjects.when_true_year and subject_match_items.year -- not
-- just the When anchor, since a subject's life-event items can predate its
-- own When date (e.g. Cleopatra's earliest Match/Order item is older than
-- the death date her When mark anchors on).

create or replace function default_when_slider_min_year()
returns int
language sql
stable
as $$
  select (
    least(
      (select min(when_true_year) from subjects),
      (select min(year) from subject_match_items)
    ) - 100
  )::int;
$$;

create or replace function default_when_slider_max_year()
returns int
language sql
stable
as $$
  select extract(year from now())::int;
$$;

create or replace function subject_when_slider_range(p_subject_id uuid)
returns table (min_year int, max_year int)
language sql
stable
as $$
  select
    coalesce(s.when_min_year, default_when_slider_min_year()),
    coalesce(s.when_max_year, default_when_slider_max_year())
  from subjects s
  where s.id = p_subject_id;
$$;
