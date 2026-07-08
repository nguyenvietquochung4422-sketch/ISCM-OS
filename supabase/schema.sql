-- ============================================================================
-- ISCM HUB (Trạm 1) — Supabase / PostgreSQL Initialization Script
-- Institute of Smart City and Management (ISCM-UEH)
-- Hybrid ERP · CRM · KMS portal on a matrix organization model
--
-- Run in the Supabase SQL Editor (or `supabase db push` via CLI).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. EXTENSIONS
-- ----------------------------------------------------------------------------
create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. ENUMERATED TYPES
-- ----------------------------------------------------------------------------
-- Global system-wide role (vertical / functional line)
create type public.system_role as enum ('Director', 'Group Head', 'Researcher', 'Assistant', 'Guest');

-- Contextual matrix role: activated per selected workspace (ERP Gien)
create type public.contextual_role as enum ('Lead', 'Manager', 'Coordinator', 'Host', 'Member');

-- Project lifecycle status
create type public.project_status as enum ('In Progress', 'Review', 'Completed');

-- KMS asset taxonomy (Trạm 1 scope: office knowledge, not raw research data)
create type public.asset_type as enum ('Document', 'Template', 'Report', 'Hyperlink');

-- CRM stakeholder layers
create type public.partner_type as enum ('Academia', 'Industry', 'Authority');

-- Data-privacy tiers driven by the Executive Admin Matrix Console
--   Draft         → project-internal only
--   Internal Open → shared across all labs via the Global Library
--   Confidential  → locked for sensitive external data
create type public.security_level as enum ('Draft', 'Internal Open', 'Confidential');

-- ----------------------------------------------------------------------------
-- 2. TABLES
-- ----------------------------------------------------------------------------

-- 2.1 users_profiles — extends Supabase auth.users with ISCM org metadata
create table public.users_profiles (
  id                    uuid primary key references auth.users (id) on delete cascade,
  email                 text not null unique
                        check (email ~* '@(st\.)?ueh\.edu\.vn$'),   -- UEH e-mails only
  full_name             text not null,
  base_functional_group text not null,                              -- e.g. 'Nghiên cứu Khoa học', 'Operation & Finance'
  global_system_role    public.system_role not null default 'Researcher',
  avatar_url            text,
  created_at            timestamptz not null default now()
);

comment on table public.users_profiles is
  'ISCM staff profile. base_functional_group = the vertical line of the matrix.';

-- 2.2 projects — workspaces (projects, labs, events) = horizontal matrix line
create table public.projects (
  id           uuid primary key default uuid_generate_v4(),
  project_code text not null unique,                                -- e.g. 'HCMC-ATLAS-26'
  project_name text not null,
  description  text,
  location_tag text,                                                -- e.g. 'Nha Trang', 'HCMC', 'Hue'
  status       public.project_status not null default 'In Progress',
  sdg_tags     integer[] not null default '{}',                     -- SDG badges on the Focus Card
  created_at   timestamptz not null default now()
);

-- 2.2b project_phases — sequential milestones in the gray Phase Box
create table public.project_phases (
  id         uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects (id) on delete cascade,
  phase_name text not null,
  start_date date,
  end_date   date,
  is_current boolean not null default false,
  sort_order integer not null default 0
);
create index project_phases_project_idx on public.project_phases (project_id);

-- 2.3 project_members — THE MATRIX JOIN TABLE (ERP Gien).
--     One user ⇄ many workspaces, with a different contextual role in each.
--     is_cross_line marks Director-approved assignments outside the member's
--     base functional group.
create table public.project_members (
  id              uuid primary key default uuid_generate_v4(),
  project_id      uuid not null references public.projects (id) on delete cascade,
  user_id         uuid not null references public.users_profiles (id) on delete cascade,
  contextual_role public.contextual_role not null default 'Member',
  is_cross_line   boolean not null default false,
  assigned_by     uuid references public.users_profiles (id),       -- Director performing the assignment
  assigned_at     timestamptz not null default now(),
  unique (project_id, user_id)                                      -- one contextual role per workspace
);

-- 2.4 project_partners — CRM Gien: multi-layer stakeholder network per project
create table public.project_partners (
  id             uuid primary key default uuid_generate_v4(),
  project_id     uuid not null references public.projects (id) on delete cascade,
  partner_name   text not null,                                     -- e.g. 'Sở QH-KT TP.HCM'
  partner_type   public.partner_type not null,
  contact_person text,
  details        text,                                              -- MOU status, scope, notes
  created_at     timestamptz not null default now()
);
create index project_partners_project_idx on public.project_partners (project_id);

-- 2.5 digital_assets — KMS Gien: every office file / template / report / link.
--     project_id is NULLABLE: global standardized templates & brand assets
--     (Kho Biểu mẫu Chuẩn) are institute-wide and belong to no single project.
create table public.digital_assets (
  id             uuid primary key default uuid_generate_v4(),
  project_id     uuid references public.projects (id) on delete cascade,
  asset_name     text not null,
  asset_type     public.asset_type not null,
  file_extension text,                                              -- '.docx', '.xlsx', '.pptx', '.pdf', 'url' …
  storage_url    text not null,                                     -- Supabase Storage path OR external Miro/Figma URL
  uploaded_by    uuid references public.users_profiles (id),
  security_level public.security_level not null default 'Draft',
  version        integer not null default 1,                        -- KMS version control
  file_size_kb   integer,
  created_at     timestamptz not null default now(),
  -- global (project-less) assets must be shareable templates/reports
  check (project_id is not null or asset_type in ('Template', 'Report'))
);
create index digital_assets_project_idx  on public.digital_assets (project_id);
create index digital_assets_security_idx on public.digital_assets (security_level);

-- 2.6 activity_feed — upload logs & workflow events (replaces Zalo chatter)
create table public.activity_feed (
  id         uuid primary key default uuid_generate_v4(),
  actor_id   uuid references public.users_profiles (id),
  project_id uuid references public.projects (id) on delete cascade,
  verb       text not null,                                         -- 'uploaded', 'approved stage', 'assigned member' …
  object_ref text,
  created_at timestamptz not null default now()
);

-- 2.7 tasks — Kanban board (ERP workflow) inside each workspace
create table public.tasks (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references public.projects (id) on delete cascade,
  title       text not null,
  column_key  text not null default 'todo'
              check (column_key in ('todo', 'in_progress', 'review', 'done')),
  assignee_id uuid references public.users_profiles (id),
  due_date    date,                                                 -- deadline shown on the task card
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3. HELPER FUNCTIONS (used by RLS policies)
-- ----------------------------------------------------------------------------
create or replace function public.is_project_member(p_project uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from project_members
    where project_id = p_project and user_id = auth.uid()
  );
$$;

create or replace function public.is_project_manager(p_project uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from project_members
    where project_id = p_project
      and user_id    = auth.uid()
      and contextual_role in ('Lead', 'Manager')
  );
$$;

create or replace function public.is_director()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from users_profiles
    where id = auth.uid() and global_system_role = 'Director'
  );
$$;

-- ----------------------------------------------------------------------------
-- 4. ROW-LEVEL SECURITY
-- ----------------------------------------------------------------------------
alter table public.users_profiles  enable row level security;
alter table public.projects        enable row level security;
alter table public.project_phases  enable row level security;
alter table public.project_members enable row level security;
alter table public.project_partners enable row level security;
alter table public.digital_assets  enable row level security;
alter table public.activity_feed   enable row level security;
alter table public.tasks           enable row level security;

-- users_profiles: staff directory readable in-house; self-service updates
create policy "profiles readable by authenticated"
  on public.users_profiles for select to authenticated using (true);
create policy "profiles self-update"
  on public.users_profiles for update to authenticated
  using (id = auth.uid() or public.is_director());

-- projects: meta visible to all staff; Director creates, managers update
create policy "projects readable by authenticated"
  on public.projects for select to authenticated using (true);
create policy "projects insert by director"
  on public.projects for insert to authenticated with check (public.is_director());
create policy "projects update by managers or director"
  on public.projects for update to authenticated
  using (public.is_project_manager(id) or public.is_director());

-- project_phases: timeline readable by staff; edited by workspace managers
create policy "phases readable by authenticated"
  on public.project_phases for select to authenticated using (true);
create policy "phases managed by project managers"
  on public.project_phases for all to authenticated
  using (public.is_project_manager(project_id) or public.is_director())
  with check (public.is_project_manager(project_id) or public.is_director());

-- project_members: readable by staff; ONLY the Director performs
-- cross-line matrix assignments via the Executive Admin Console.
create policy "memberships readable by authenticated"
  on public.project_members for select to authenticated using (true);
create policy "memberships managed by director"
  on public.project_members for all to authenticated
  using (public.is_director()) with check (public.is_director());

-- project_partners (CRM): visible inside the owning workspace;
-- maintained by workspace managers or the Director.
create policy "partners readable by project members"
  on public.project_partners for select to authenticated
  using (public.is_project_member(project_id) or public.is_director());
create policy "partners managed by project managers"
  on public.project_partners for all to authenticated
  using (public.is_project_manager(project_id) or public.is_director())
  with check (public.is_project_manager(project_id) or public.is_director());

-- digital_assets: THE core privacy rule.
--   'Internal Open'          → every authenticated staff member (Global Library)
--   'Draft' / 'Confidential' → owning project team (or Director) only
create policy "assets: open assets or own project"
  on public.digital_assets for select to authenticated
  using (
    security_level = 'Internal Open'
    or (project_id is not null and public.is_project_member(project_id))
    or public.is_director()
  );
create policy "assets: members upload into their project"
  on public.digital_assets for insert to authenticated
  with check (
    uploaded_by = auth.uid()
    and (
      (project_id is not null and public.is_project_member(project_id))
      or public.is_director()                    -- global templates: Director only
    )
  );
create policy "assets: managers or uploader may update"
  on public.digital_assets for update to authenticated
  using (
    uploaded_by = auth.uid()
    or (project_id is not null and public.is_project_manager(project_id))
    or public.is_director()                      -- security_level state changes
  );
create policy "assets: managers may delete"
  on public.digital_assets for delete to authenticated
  using ((project_id is not null and public.is_project_manager(project_id)) or public.is_director());

-- activity_feed: readable by all staff; rows inserted by triggers or self
create policy "feed readable by authenticated"
  on public.activity_feed for select to authenticated using (true);
create policy "feed insert self"
  on public.activity_feed for insert to authenticated with check (actor_id = auth.uid());

-- tasks (ERP Kanban): visible & editable by workspace members
create policy "tasks readable by project members"
  on public.tasks for select to authenticated
  using (public.is_project_member(project_id) or public.is_director());
create policy "tasks writable by project members"
  on public.tasks for all to authenticated
  using (public.is_project_member(project_id) or public.is_director())
  with check (public.is_project_member(project_id) or public.is_director());

-- ----------------------------------------------------------------------------
-- 5. AUTOMATION — upload log trigger (feeds the executive activity timeline)
-- ----------------------------------------------------------------------------
create or replace function public.log_asset_upload()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into activity_feed (actor_id, project_id, verb, object_ref)
  values (new.uploaded_by, new.project_id, 'uploaded', new.asset_name || ' (v' || new.version || ')');
  return new;
end;
$$;

create trigger trg_log_asset_upload
  after insert on public.digital_assets
  for each row execute function public.log_asset_upload();

-- ----------------------------------------------------------------------------
-- 6. STORAGE BUCKET (private; downloads via signed URLs)
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('project-assets', 'project-assets', false)
on conflict (id) do nothing;

create policy "storage read for authenticated"
  on storage.objects for select to authenticated
  using (bucket_id = 'project-assets');
create policy "storage upload for authenticated"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'project-assets');

-- ----------------------------------------------------------------------------
-- 7. SEED DATA (demo — safe to delete in production)
--    User rows require matching auth.users entries; create demo accounts in
--    Supabase Auth first, then update the UUIDs below.
-- ----------------------------------------------------------------------------
insert into public.projects (id, project_code, project_name, description, location_tag, status, sdg_tags) values
  ('11111111-1111-1111-1111-111111111111', 'HCMC-ATLAS-26', 'HCMC Walkability Atlas',
   '2SFCA accessibility modelling of pedestrian infrastructure across District 1 & 3.', 'HCMC', 'In Progress', '{3,11,13}'),
  ('22222222-2222-2222-2222-222222222222', 'NT-NIGHT-26', 'Nha Trang Night Economy Mapping',
   'Spatio-temporal survey of night-time commercial activity along the coastal strip.', 'Nha Trang', 'Review', '{8,11,17}'),
  ('33333333-3333-3333-3333-333333333333', 'HUE-HERIT-25', 'Hue Heritage Buffer Zones',
   'GIS delineation of UNESCO heritage protection buffers for the Citadel complex.', 'Hue', 'Completed', '{11,17}');

insert into public.project_phases (project_id, phase_name, start_date, end_date, is_current, sort_order) values
  ('11111111-1111-1111-1111-111111111111', 'Field Survey',   '2026-03-15', '2026-05-30', false, 1),
  ('11111111-1111-1111-1111-111111111111', '2SFCA Analysis', '2026-06-01', '2026-08-15', true,  2),
  ('11111111-1111-1111-1111-111111111111', 'Atlas Design',   '2026-08-16', '2026-10-30', false, 3),
  ('22222222-2222-2222-2222-222222222222', 'Night Surveys',  '2026-02-01', '2026-05-15', false, 1),
  ('22222222-2222-2222-2222-222222222222', 'KDE Modelling',  '2026-05-16', '2026-06-30', false, 2),
  ('22222222-2222-2222-2222-222222222222', 'Peer Review',    '2026-07-01', '2026-07-31', true,  3);

insert into public.project_partners (project_id, partner_name, partner_type, contact_person, details) values
  ('11111111-1111-1111-1111-111111111111', 'Sở Quy hoạch – Kiến trúc TP.HCM', 'Authority',
   'Ông Trần Văn Bình — Phòng Hạ tầng', 'Data-sharing MOU signed 03/2026; sidewalk inventory access.'),
  ('11111111-1111-1111-1111-111111111111', 'Grab Vietnam', 'Industry',
   'Ms. Đỗ Hải Yến — GrabMaps Partnerships', 'Anonymized trip heatmaps for accessibility calibration.'),
  ('11111111-1111-1111-1111-111111111111', 'Politecnico di Milano — DAStU', 'Academia',
   'Prof. L. Rossi', 'Joint Q1 publication on 2SFCA methodology.'),
  ('22222222-2222-2222-2222-222222222222', 'UBND TP. Nha Trang', 'Authority',
   'Bà Nguyễn Thị Hòa — Văn phòng UBND', 'Night-market licensing dataset & survey permits.'),
  ('22222222-2222-2222-2222-222222222222', 'Hochschule Worms', 'Academia',
   'Prof. K. Weber', 'Comparative night-economy framework, RTD 2026 panel.');
