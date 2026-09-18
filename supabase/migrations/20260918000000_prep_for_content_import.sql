-- Prep work surfaced by importing the real 175-subject content workbook:
--
-- 1. subjects.external_id: a stable link back to the workbook's own ids
--    (P001, E001, L001, ...) so re-imports/updates can match by source id
--    rather than by a generated UUID.
-- 2. subject_questions.mechanic_type: the Location batch authors more
--    specific mechanic types than Person/Event does (know_landmark,
--    see_location, see_landmark, inventions) that weren't in the original
--    enumerated list.
-- 3. Publish validation only fired on UPDATE, so a row inserted with
--    status = 'published' directly skipped it entirely. Fixed to also run
--    on INSERT (in practice this still means "insert as draft, add
--    children, then update to published" -- a subject can't have any
--    Match/Order items or questions yet on its own INSERT since they're
--    FK'd to it, so publishing in the same INSERT can never pass).

alter table subjects add column external_id text unique;

alter table subject_questions drop constraint subject_questions_mechanic_type_check;
alter table subject_questions add constraint subject_questions_mechanic_type_check check (mechanic_type in (
  'know', 'know_landmark', 'see', 'see_location', 'see_landmark', 'era', 'succession',
  'nickname', 'language', 'flag', 'flag_meaning', 'current_country', 'legacy',
  'inventions', 'world_firsts', 'contemporaries', 'relationships'
));

create or replace function enforce_subject_publish_requirements()
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

drop trigger subjects_enforce_publish_requirements on subjects;

create trigger subjects_enforce_publish_requirements
  before insert or update on subjects
  for each row execute function enforce_subject_publish_requirements();
