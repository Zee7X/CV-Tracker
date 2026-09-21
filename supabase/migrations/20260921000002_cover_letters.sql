-- Migration: Create cover_letters table and RLS policies
-- Date: 2026-09-21

create table if not exists public.cover_letters (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  template text not null default 'formal_id' check (template in ('formal_id', 'professional_en', 'email_short', 'creative')),
  job_title text not null,
  company_name text not null,
  company_address text,
  recipient_name text,
  source text,
  letter_date text not null,
  sender_name text not null,
  sender_email text not null,
  sender_phone text,
  sender_location text,
  opening text not null default '',
  body text not null default '',
  closing text not null default '',
  cv_id uuid references public.cvs(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists cover_letters_user_id_idx on public.cover_letters(user_id);
create index if not exists cover_letters_cv_id_idx on public.cover_letters(cv_id);

-- Enable RLS
alter table public.cover_letters enable row level security;

-- Policies
create policy "Users can view own cover letters"
  on public.cover_letters for select
  using (auth.uid() = user_id);

create policy "Users can insert own cover letters"
  on public.cover_letters for insert
  with check (auth.uid() = user_id);

create policy "Users can update own cover letters"
  on public.cover_letters for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own cover letters"
  on public.cover_letters for delete
  using (auth.uid() = user_id);
