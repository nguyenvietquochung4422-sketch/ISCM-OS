-- Kho nhân sự công tác — collaborators who work with ISCM but are not on the
-- roster. Filled in from the Research List drawer ("Members (Outside ISCM)"),
-- where học vị / họ tên / nơi công tác are all required before a person can be
-- added to a task.
--
-- Kept in sync with the live schema (project gjgowdqltcdkbtuabknf).

create table if not exists public.external_members (
  id          bigserial primary key,
  degree      text not null default '',   -- học vị: PGS. TS., ThS., …
  full_name   text not null,              -- họ tên
  affiliation text not null,              -- nơi công tác
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint external_members_person_key unique (full_name, affiliation)
);

alter table public.external_members enable row level security;

-- Same gate as public.iscm_research_list: anyone signed in can read, only a
-- top admin or the Research head can write.
create policy "Allow authenticated read access"
  on public.external_members for select to authenticated using (true);

create policy "external_members write (research head)"
  on public.external_members for insert to authenticated
  with check (can_manage_group('Nghiên cứu Khoa học'::text));

create policy "external_members update (research head)"
  on public.external_members for update to authenticated
  using (can_manage_group('Nghiên cứu Khoa học'::text))
  with check (can_manage_group('Nghiên cứu Khoa học'::text));

create policy "external_members delete (research head)"
  on public.external_members for delete to authenticated
  using (can_manage_group('Nghiên cứu Khoa học'::text));
