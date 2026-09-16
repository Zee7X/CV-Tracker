import { createClient } from '@/lib/supabase/server'
import type { DashboardData, DashboardMetrics } from '@/types/dashboard'
import type { CV, CVTemplate, PersonalInfo } from '@/types/cv'
import type { JobApplicationWithCV, ApplicationStatus } from '@/types/application'

/**
 * Fetches accurate counts for user-owned CVs and job applications.
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      totalCVs: 0,
      totalApplications: 0,
      interviewCount: 0,
      offersCount: 0,
    }
  }

  const [cvsRes, appsRes, interviewsRes, offersRes] = await Promise.all([
    supabase
      .from('cvs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('job_applications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('job_applications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'interview'),
    supabase
      .from('job_applications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('status', ['offering', 'accepted']),
  ])

  return {
    totalCVs: cvsRes.count ?? 0,
    totalApplications: appsRes.count ?? 0,
    interviewCount: interviewsRes.count ?? 0,
    offersCount: offersRes.count ?? 0,
  }
}

/**
 * Fetches recent CVs for the authenticated user, ordered by most recently updated.
 */
export async function getRecentCVs(limit = 5): Promise<CV[]> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return []
  }

  const { data, error } = await supabase
    .from('cvs')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (error || !data) {
    return []
  }

  return data.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    template: (row.template as CVTemplate) || 'professional',
    personal_info: (row.personal_info as unknown as PersonalInfo) || { full_name: '', email: '' },
    summary: row.summary,
    skills: Array.isArray(row.skills) ? (row.skills as string[]) : [],
    created_at: row.created_at,
    updated_at: row.updated_at,
  }))
}

/**
 * Fetches recent job applications for the authenticated user, ordered by applied date and creation time.
 */
export async function getRecentApplications(limit = 5): Promise<JobApplicationWithCV[]> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return []
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
    .eq('user_id', user.id)
    .order('applied_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

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
 * Fetches all dashboard data (metrics, recent CVs, recent applications) in parallel.
 */
export async function getDashboardData(limit = 5): Promise<DashboardData> {
  const [metrics, recentCVs, recentApplications] = await Promise.all([
    getDashboardMetrics(),
    getRecentCVs(limit),
    getRecentApplications(limit),
  ])

  return {
    metrics,
    recentCVs,
    recentApplications,
  }
}
