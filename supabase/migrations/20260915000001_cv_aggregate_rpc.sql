-- Atomic CV aggregate write RPC functions
-- A single plpgsql function invocation is an implicit transaction: if any
-- statement inside raises, all prior writes in the same call are rolled
-- back automatically. security invoker (the default) means these run as
-- the calling role, so existing RLS policies on cvs/cv_* still apply via
-- auth.uid() -- no privilege escalation is introduced.

-- ============================================================================
-- create_cv_with_relations
-- ============================================================================
create or replace function public.create_cv_with_relations(
  p_name text,
  p_template text,
  p_personal_info jsonb,
  p_summary text,
  p_skills jsonb,
  p_experiences jsonb,
  p_educations jsonb,
  p_projects jsonb,
  p_certifications jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_cv_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  insert into public.cvs (user_id, name, template, personal_info, summary, skills)
  values (auth.uid(), p_name, p_template, p_personal_info, coalesce(p_summary, null), p_skills)
  returning id into v_cv_id;

  insert into public.cv_experiences (cv_id, company, position, location, start_date, end_date, is_current, description, sort_order)
  select v_cv_id, x.company, x.position, x.location, x.start_date, x.end_date, x.is_current, x.description, x.sort_order
  from jsonb_to_recordset(p_experiences) as x(
    company text, position text, location text, start_date date,
    end_date date, is_current boolean, description text, sort_order integer
  );

  insert into public.cv_educations (cv_id, institution, degree, field_of_study, start_date, end_date, description, sort_order)
  select v_cv_id, x.institution, x.degree, x.field_of_study, x.start_date, x.end_date, x.description, x.sort_order
  from jsonb_to_recordset(p_educations) as x(
    institution text, degree text, field_of_study text, start_date date,
    end_date date, description text, sort_order integer
  );

  insert into public.cv_projects (cv_id, name, description, project_url, start_date, end_date, sort_order)
  select v_cv_id, x.name, x.description, x.project_url, x.start_date, x.end_date, x.sort_order
  from jsonb_to_recordset(p_projects) as x(
    name text, description text, project_url text, start_date date, end_date date, sort_order integer
  );

  insert into public.cv_certifications (cv_id, name, issuer, issue_date, credential_url, sort_order)
  select v_cv_id, x.name, x.issuer, x.issue_date, x.credential_url, x.sort_order
  from jsonb_to_recordset(p_certifications) as x(
    name text, issuer text, issue_date date, credential_url text, sort_order integer
  );

  return v_cv_id;
end;
$$;

revoke execute on function public.create_cv_with_relations(text, text, jsonb, text, jsonb, jsonb, jsonb, jsonb, jsonb) from public, anon;
grant execute on function public.create_cv_with_relations(text, text, jsonb, text, jsonb, jsonb, jsonb, jsonb, jsonb) to authenticated;

-- ============================================================================
-- update_cv_with_relations
-- ============================================================================
create or replace function public.update_cv_with_relations(
  p_cv_id uuid,
  p_name text,
  p_template text,
  p_personal_info jsonb,
  p_summary text,
  p_skills jsonb,
  p_experiences jsonb,
  p_educations jsonb,
  p_projects jsonb,
  p_certifications jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  update public.cvs
  set name = p_name,
      template = p_template,
      personal_info = p_personal_info,
      summary = p_summary,
      skills = p_skills,
      updated_at = now()
  where id = p_cv_id and user_id = auth.uid();

  if not found then
    raise exception 'CV not found or not owned by user';
  end if;

  delete from public.cv_experiences where cv_id = p_cv_id;
  delete from public.cv_educations where cv_id = p_cv_id;
  delete from public.cv_projects where cv_id = p_cv_id;
  delete from public.cv_certifications where cv_id = p_cv_id;

  insert into public.cv_experiences (cv_id, company, position, location, start_date, end_date, is_current, description, sort_order)
  select p_cv_id, x.company, x.position, x.location, x.start_date, x.end_date, x.is_current, x.description, x.sort_order
  from jsonb_to_recordset(p_experiences) as x(
    company text, position text, location text, start_date date,
    end_date date, is_current boolean, description text, sort_order integer
  );

  insert into public.cv_educations (cv_id, institution, degree, field_of_study, start_date, end_date, description, sort_order)
  select p_cv_id, x.institution, x.degree, x.field_of_study, x.start_date, x.end_date, x.description, x.sort_order
  from jsonb_to_recordset(p_educations) as x(
    institution text, degree text, field_of_study text, start_date date,
    end_date date, description text, sort_order integer
  );

  insert into public.cv_projects (cv_id, name, description, project_url, start_date, end_date, sort_order)
  select p_cv_id, x.name, x.description, x.project_url, x.start_date, x.end_date, x.sort_order
  from jsonb_to_recordset(p_projects) as x(
    name text, description text, project_url text, start_date date, end_date date, sort_order integer
  );

  insert into public.cv_certifications (cv_id, name, issuer, issue_date, credential_url, sort_order)
  select p_cv_id, x.name, x.issuer, x.issue_date, x.credential_url, x.sort_order
  from jsonb_to_recordset(p_certifications) as x(
    name text, issuer text, issue_date date, credential_url text, sort_order integer
  );

  return p_cv_id;
end;
$$;

revoke execute on function public.update_cv_with_relations(uuid, text, text, jsonb, text, jsonb, jsonb, jsonb, jsonb, jsonb) from public, anon;
grant execute on function public.update_cv_with_relations(uuid, text, text, jsonb, text, jsonb, jsonb, jsonb, jsonb, jsonb) to authenticated;

-- ============================================================================
-- duplicate_cv_with_relations
-- ============================================================================
create or replace function public.duplicate_cv_with_relations(p_source_cv_id uuid)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_source record;
  v_new_cv_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  select * into v_source from public.cvs where id = p_source_cv_id and user_id = auth.uid();
  if not found then
    raise exception 'Source CV not found or not owned by user';
  end if;

  insert into public.cvs (user_id, name, template, personal_info, summary, skills)
  values (auth.uid(), v_source.name || ' (Copy)', v_source.template, v_source.personal_info, v_source.summary, v_source.skills)
  returning id into v_new_cv_id;

  insert into public.cv_experiences (cv_id, company, position, location, start_date, end_date, is_current, description, sort_order)
  select v_new_cv_id, company, position, location, start_date, end_date, is_current, description, sort_order
  from public.cv_experiences where cv_id = p_source_cv_id;

  insert into public.cv_educations (cv_id, institution, degree, field_of_study, start_date, end_date, description, sort_order)
  select v_new_cv_id, institution, degree, field_of_study, start_date, end_date, description, sort_order
  from public.cv_educations where cv_id = p_source_cv_id;

  insert into public.cv_projects (cv_id, name, description, project_url, start_date, end_date, sort_order)
  select v_new_cv_id, name, description, project_url, start_date, end_date, sort_order
  from public.cv_projects where cv_id = p_source_cv_id;

  insert into public.cv_certifications (cv_id, name, issuer, issue_date, credential_url, sort_order)
  select v_new_cv_id, name, issuer, issue_date, credential_url, sort_order
  from public.cv_certifications where cv_id = p_source_cv_id;

  return v_new_cv_id;
end;
$$;

revoke execute on function public.duplicate_cv_with_relations(uuid) from public, anon;
grant execute on function public.duplicate_cv_with_relations(uuid) to authenticated;
