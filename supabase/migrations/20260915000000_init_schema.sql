-- CV Tracker Database Schema & RLS
-- Migration: Initial schema with profiles, CVs, and job applications

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- profiles: extends auth.users with application-specific profile data
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- cvs: user's curriculum vitae documents
create table public.cvs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  template text not null check (template in ('ats', 'professional', 'modern')),
  personal_info jsonb not null default '{}',
  summary text,
  skills jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- cv_experiences: work experience entries for a CV
create table public.cv_experiences (
  id uuid primary key default uuid_generate_v4(),
  cv_id uuid not null references public.cvs(id) on delete cascade,
  company text not null,
  position text not null,
  location text,
  start_date date not null,
  end_date date,
  is_current boolean not null default false,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- cv_educations: education entries for a CV
create table public.cv_educations (
  id uuid primary key default uuid_generate_v4(),
  cv_id uuid not null references public.cvs(id) on delete cascade,
  institution text not null,
  degree text,
  field_of_study text,
  start_date date,
  end_date date,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- cv_projects: project entries for a CV
create table public.cv_projects (
  id uuid primary key default uuid_generate_v4(),
  cv_id uuid not null references public.cvs(id) on delete cascade,
  name text not null,
  description text,
  project_url text,
  start_date date,
  end_date date,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- cv_certifications: certification entries for a CV
create table public.cv_certifications (
  id uuid primary key default uuid_generate_v4(),
  cv_id uuid not null references public.cvs(id) on delete cascade,
  name text not null,
  issuer text,
  issue_date date,
  credential_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- job_applications: track job applications
create table public.job_applications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  cv_id uuid references public.cvs(id) on delete set null,
  company_name text not null,
  position text not null,
  applied_date date not null,
  status text not null check (status in ('applied', 'screening', 'interview', 'offering', 'accepted', 'rejected')),
  job_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

create index cvs_user_id_idx on public.cvs(user_id);
create index cv_experiences_cv_id_idx on public.cv_experiences(cv_id);
create index cv_educations_cv_id_idx on public.cv_educations(cv_id);
create index cv_projects_cv_id_idx on public.cv_projects(cv_id);
create index cv_certifications_cv_id_idx on public.cv_certifications(cv_id);
create index job_applications_user_id_idx on public.job_applications(user_id);
create index job_applications_cv_id_idx on public.job_applications(cv_id);
create index job_applications_status_idx on public.job_applications(status);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- auto-create profile on auth.users insert
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- enforce same-owner CV validation on job_applications
create or replace function public.enforce_job_application_cv_owner()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.cv_id is not null then
    if not exists (
      select 1 from public.cvs
      where id = new.cv_id and user_id = new.user_id
    ) then
      raise exception 'CV does not belong to the user';
    end if;
  end if;
  return new;
end;
$$;

create trigger enforce_job_application_cv_owner
  before insert or update on public.job_applications
  for each row execute function public.enforce_job_application_cv_owner();

-- updated_at triggers
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.cvs
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.cv_experiences
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.cv_educations
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.cv_projects
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.cv_certifications
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.job_applications
  for each row execute function public.handle_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.cvs enable row level security;
alter table public.cv_experiences enable row level security;
alter table public.cv_educations enable row level security;
alter table public.cv_projects enable row level security;
alter table public.cv_certifications enable row level security;
alter table public.job_applications enable row level security;

-- profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- cvs policies
create policy "Users can view own CVs"
  on public.cvs for select
  using (auth.uid() = user_id);

create policy "Users can insert own CVs"
  on public.cvs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own CVs"
  on public.cvs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own CVs"
  on public.cvs for delete
  using (auth.uid() = user_id);

-- cv_experiences policies (check ownership through parent cv)
create policy "Users can view own CV experiences"
  on public.cv_experiences for select
  using (exists (
    select 1 from public.cvs
    where cvs.id = cv_experiences.cv_id
    and cvs.user_id = auth.uid()
  ));

create policy "Users can insert own CV experiences"
  on public.cv_experiences for insert
  with check (exists (
    select 1 from public.cvs
    where cvs.id = cv_experiences.cv_id
    and cvs.user_id = auth.uid()
  ));

create policy "Users can update own CV experiences"
  on public.cv_experiences for update
  using (exists (
    select 1 from public.cvs
    where cvs.id = cv_experiences.cv_id
    and cvs.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.cvs
    where cvs.id = cv_experiences.cv_id
    and cvs.user_id = auth.uid()
  ));

create policy "Users can delete own CV experiences"
  on public.cv_experiences for delete
  using (exists (
    select 1 from public.cvs
    where cvs.id = cv_experiences.cv_id
    and cvs.user_id = auth.uid()
  ));

-- cv_educations policies (check ownership through parent cv)
create policy "Users can view own CV educations"
  on public.cv_educations for select
  using (exists (
    select 1 from public.cvs
    where cvs.id = cv_educations.cv_id
    and cvs.user_id = auth.uid()
  ));

create policy "Users can insert own CV educations"
  on public.cv_educations for insert
  with check (exists (
    select 1 from public.cvs
    where cvs.id = cv_educations.cv_id
    and cvs.user_id = auth.uid()
  ));

create policy "Users can update own CV educations"
  on public.cv_educations for update
  using (exists (
    select 1 from public.cvs
    where cvs.id = cv_educations.cv_id
    and cvs.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.cvs
    where cvs.id = cv_educations.cv_id
    and cvs.user_id = auth.uid()
  ));

create policy "Users can delete own CV educations"
  on public.cv_educations for delete
  using (exists (
    select 1 from public.cvs
    where cvs.id = cv_educations.cv_id
    and cvs.user_id = auth.uid()
  ));

-- cv_projects policies (check ownership through parent cv)
create policy "Users can view own CV projects"
  on public.cv_projects for select
  using (exists (
    select 1 from public.cvs
    where cvs.id = cv_projects.cv_id
    and cvs.user_id = auth.uid()
  ));

create policy "Users can insert own CV projects"
  on public.cv_projects for insert
  with check (exists (
    select 1 from public.cvs
    where cvs.id = cv_projects.cv_id
    and cvs.user_id = auth.uid()
  ));

create policy "Users can update own CV projects"
  on public.cv_projects for update
  using (exists (
    select 1 from public.cvs
    where cvs.id = cv_projects.cv_id
    and cvs.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.cvs
    where cvs.id = cv_projects.cv_id
    and cvs.user_id = auth.uid()
  ));

create policy "Users can delete own CV projects"
  on public.cv_projects for delete
  using (exists (
    select 1 from public.cvs
    where cvs.id = cv_projects.cv_id
    and cvs.user_id = auth.uid()
  ));

-- cv_certifications policies (check ownership through parent cv)
create policy "Users can view own CV certifications"
  on public.cv_certifications for select
  using (exists (
    select 1 from public.cvs
    where cvs.id = cv_certifications.cv_id
    and cvs.user_id = auth.uid()
  ));

create policy "Users can insert own CV certifications"
  on public.cv_certifications for insert
  with check (exists (
    select 1 from public.cvs
    where cvs.id = cv_certifications.cv_id
    and cvs.user_id = auth.uid()
  ));

create policy "Users can update own CV certifications"
  on public.cv_certifications for update
  using (exists (
    select 1 from public.cvs
    where cvs.id = cv_certifications.cv_id
    and cvs.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.cvs
    where cvs.id = cv_certifications.cv_id
    and cvs.user_id = auth.uid()
  ));

create policy "Users can delete own CV certifications"
  on public.cv_certifications for delete
  using (exists (
    select 1 from public.cvs
    where cvs.id = cv_certifications.cv_id
    and cvs.user_id = auth.uid()
  ));

-- job_applications policies
create policy "Users can view own job applications"
  on public.job_applications for select
  using (auth.uid() = user_id);

create policy "Users can insert own job applications"
  on public.job_applications for insert
  with check (auth.uid() = user_id);

create policy "Users can update own job applications"
  on public.job_applications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own job applications"
  on public.job_applications for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- HARDENING & PERMISSIONS
-- ============================================================================

-- Revoke direct RPC execution on trigger functions from public/client roles
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.enforce_job_application_cv_owner() from public, anon, authenticated;

