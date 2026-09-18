-- Enable Row Level Security on every table and grant public, read-only access
-- to published content. Supabase exposes `public` tables through its API, so
-- without RLS anyone holding the anon key could read and write them.
--
-- No insert/update/delete policies are defined, so writes are denied for
-- anon and authenticated; the service role bypasses RLS and is the path for
-- imports and admin tooling.
--
-- Drafts are invisible to anon/authenticated. The child-table policies check
-- the parent subject's status, so unpublished subjects' rows are hidden too.

alter table collections enable row level security;
alter table subjects enable row level security;
alter table subject_collections enable row level security;
alter table subject_images enable row level security;
alter table subject_questions enable row level security;
alter table subject_match_items enable row level security;

create policy collections_public_read on collections
  for select to anon, authenticated
  using (true);

create policy subjects_public_read_published on subjects
  for select to anon, authenticated
  using (status = 'published');

create policy subject_collections_public_read_published on subject_collections
  for select to anon, authenticated
  using (exists (
    select 1 from subjects s
    where s.id = subject_collections.subject_id and s.status = 'published'
  ));

create policy subject_images_public_read_published on subject_images
  for select to anon, authenticated
  using (exists (
    select 1 from subjects s
    where s.id = subject_images.subject_id and s.status = 'published'
  ));

create policy subject_questions_public_read_published on subject_questions
  for select to anon, authenticated
  using (exists (
    select 1 from subjects s
    where s.id = subject_questions.subject_id and s.status = 'published'
  ));

create policy subject_match_items_public_read_published on subject_match_items
  for select to anon, authenticated
  using (exists (
    select 1 from subjects s
    where s.id = subject_match_items.subject_id and s.status = 'published'
  ));
