import { createClient } from '@/lib/supabase/server'
import type { JobApplicationWithCV, ApplicationStatus } from '@/types/application'
import type { CVTemplate } from '@/types/cv'

export interface GetApplicationsOptions {
  search?: string
  status?: ApplicationStatus | 'all'
}

/**
 * Fetches all job applications for the authenticated user,
 * with optional text search (company/position) and status filtering.
 */
export async function getUserApplications(
  options?: GetApplicationsOptions
): Promise<JobApplicationWithCV[]> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return []
  }

  let query = supabase
    .from('job_applications')
    .select(
      `
      id,
      user_id,
      cv_id,
      company_name,
      position,
      applied_date,
      status,
      job_url,
      notes,
      created_at,
      updated_at,
      cv:cvs(id, name, template)
    `
    )
    .eq('user_id', user.id)

  if (options?.status && options.status !== 'all') {
    query = query.eq('status', options.status)
  }

  if (options?.search && options.search.trim()) {
    const term = options.search.trim()
    query = query.or(`company_name.ilike.%${term}%,position.ilike.%${term}%`)
  }

  query = query
    .order('applied_date', { ascending: false })
    .order('created_at', { ascending: false })

  const { data, error } = await query

  if (error || !data) {
    return []
  }

  return (
    data as unknown as (Record<string, unknown> & {
      cv?: { id: string; name: string; template: CVTemplate } | null
    })[]
  ).map((item) => ({
    id: item.id as string,
    user_id: item.user_id as string,
    cv_id: (item.cv_id as string | null) ?? null,
    company_name: item.company_name as string,
    position: item.position as string,
    applied_date: item.applied_date as string,
    status: item.status as ApplicationStatus,
    job_url: (item.job_url as string | null) ?? null,
    notes: (item.notes as string | null) ?? null,
    created_at: item.created_at as string,
    updated_at: item.updated_at as string,
    cv: item.cv ? { id: item.cv.id, name: item.cv.name, template: item.cv.template } : null,
  }))
}

/**
 * Fetches a single job application by ID for the authenticated user.
 */
export async function getApplicationById(id: string): Promise<JobApplicationWithCV | null> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  const { data, error } = await supabase
    .from('job_applications')
    .select(
      `
      id,
      user_id,
      cv_id,
      company_name,
      position,
      applied_date,
      status,
      job_url,
      notes,
      created_at,
      updated_at,
      cv:cvs(id, name, template)
    `
    )
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    return null
  }

  const item = data as unknown as Record<string, unknown> & {
    cv?: { id: string; name: string; template: CVTemplate } | null
  }

  return {
    id: item.id as string,
    user_id: item.user_id as string,
    cv_id: (item.cv_id as string | null) ?? null,
    company_name: item.company_name as string,
    position: item.position as string,
    applied_date: item.applied_date as string,
    status: item.status as ApplicationStatus,
    job_url: (item.job_url as string | null) ?? null,
    notes: (item.notes as string | null) ?? null,
    created_at: item.created_at as string,
    updated_at: item.updated_at as string,
    cv: item.cv ? { id: item.cv.id, name: item.cv.name, template: item.cv.template } : null,
  }
}
