import { createClient } from '@/lib/supabase/server'
import type { CV, CVTemplate, PersonalInfo } from '@/types/cv'
import type { ApplicationStatus, JobApplicationWithCV } from '@/types/application'

export interface OverviewData {
  firstName: string
  applications: JobApplicationWithCV[]
  cvs: CV[]
  letterCount: number
}

/**
 * Everything the overview needs in one round trip. A job seeker has tens of
 * applications, not thousands, so the page derives its numbers from the full
 * list instead of running a count query per figure.
 */
export async function getOverviewData(): Promise<OverviewData> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { firstName: '', applications: [], cvs: [], letterCount: 0 }

  const [profileRes, appsRes, cvsRes, lettersRes] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle(),
    supabase
      .from('job_applications')
      .select('id, user_id, cv_id, company_name, position, applied_date, status, job_url, notes, created_at, updated_at, cv:cvs(id, name, template)')
      .eq('user_id', user.id)
      .order('applied_date', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase.from('cvs').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }),
    supabase.from('cover_letters').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  const fullName = profileRes.data?.full_name || (user.user_metadata?.full_name as string | undefined) || ''

  const applications = ((appsRes.data ?? []) as unknown as (Record<string, unknown> & {
    cv?: { id: string; name: string; template: CVTemplate } | null
  })[]).map((item) => ({
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

  const cvs: CV[] = (cvsRes.data ?? []).map((row) => ({
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    template: (row.template as CVTemplate) || 'ats',
    personal_info: (row.personal_info as unknown as PersonalInfo) || { full_name: '', email: '' },
    summary: row.summary,
    skills: Array.isArray(row.skills) ? (row.skills as string[]) : [],
    created_at: row.created_at,
    updated_at: row.updated_at,
  }))

  return {
    firstName: fullName.trim().split(/\s+/)[0] ?? '',
    applications,
    cvs,
    letterCount: lettersRes.count ?? 0,
  }
}

const DAY = 24 * 60 * 60 * 1000

function daysSince(date: string, now: number) {
  const plain = /^\d{4}-\d{2}-\d{2}$/.test(date)
  const then = plain ? new Date(`${date}T00:00:00`).getTime() : new Date(date).getTime()
  return Math.floor((now - then) / DAY)
}

export const OPEN_STATUSES: ApplicationStatus[] = ['applied', 'screening', 'interview', 'offering']

/** Applications still waiting on the company after this many days get a follow-up nudge. */
export const FOLLOW_UP_AFTER_DAYS = 7

export function summarize(applications: JobApplicationWithCV[], now = Date.now()) {
  const byStatus = {} as Record<ApplicationStatus, number>
  for (const app of applications) byStatus[app.status] = (byStatus[app.status] ?? 0) + 1

  const open = applications.filter((app) => OPEN_STATUSES.includes(app.status)).length
  const heardBack = applications.filter((app) => app.status !== 'applied').length
  const last30 = applications.filter((app) => daysSince(app.applied_date, now) <= 30).length

  const followUps = applications
    .filter((app) => (app.status === 'applied' || app.status === 'screening') && daysSince(app.applied_date, now) >= FOLLOW_UP_AFTER_DAYS)
    .map((app) => ({ app, days: daysSince(app.applied_date, now) }))
    .sort((a, b) => b.days - a.days)

  return {
    total: applications.length,
    open,
    last30,
    interviews: byStatus.interview ?? 0,
    offers: (byStatus.offering ?? 0) + (byStatus.accepted ?? 0),
    responseRate: applications.length ? Math.round((heardBack / applications.length) * 100) : null,
    byStatus,
    followUps,
  }
}
