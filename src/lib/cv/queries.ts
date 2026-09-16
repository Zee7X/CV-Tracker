import { createClient } from '@/lib/supabase/server'
import type { CV, CVWithRelations, Experience, Education, Project, Certification, PersonalInfo, CVTemplate } from '@/types/cv'

/**
 * Fetches all CVs owned by the authenticated user.
 */
export async function getUserCVs(): Promise<CV[]> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return []
  }

  const { data, error } = await supabase
    .from('cvs')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

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
 * Fetches a single CV by ID, verifying user ownership.
 */
export async function getCVById(id: string): Promise<CV | null> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  const { data, error } = await supabase
    .from('cvs')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    return null
  }

  return {
    id: data.id,
    user_id: data.user_id,
    name: data.name,
    template: (data.template as CVTemplate) || 'professional',
    personal_info: (data.personal_info as unknown as PersonalInfo) || { full_name: '', email: '' },
    summary: data.summary,
    skills: Array.isArray(data.skills) ? (data.skills as string[]) : [],
    created_at: data.created_at,
    updated_at: data.updated_at,
  }
}

/**
 * Fetches a CV with all related experiences, educations, projects, and certifications.
 */
export async function getCVWithRelations(id: string): Promise<CVWithRelations | null> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  const { data: cv, error: cvError } = await supabase
    .from('cvs')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (cvError || !cv) {
    return null
  }

  const [expRes, eduRes, projRes, certRes] = await Promise.all([
    supabase
      .from('cv_experiences')
      .select('*')
      .eq('cv_id', id)
      .order('sort_order', { ascending: true })
      .order('start_date', { ascending: false }),
    supabase
      .from('cv_educations')
      .select('*')
      .eq('cv_id', id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('cv_projects')
      .select('*')
      .eq('cv_id', id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('cv_certifications')
      .select('*')
      .eq('cv_id', id)
      .order('sort_order', { ascending: true }),
  ])

  const experiences: Experience[] = (expRes.data || []).map((exp) => ({
    id: exp.id,
    cv_id: exp.cv_id,
    company: exp.company,
    position: exp.position,
    location: exp.location ?? undefined,
    start_date: exp.start_date,
    end_date: exp.end_date,
    is_current: exp.is_current,
    description: exp.description ?? undefined,
    sort_order: exp.sort_order,
  }))

  const educations: Education[] = (eduRes.data || []).map((edu) => ({
    id: edu.id,
    cv_id: edu.cv_id,
    institution: edu.institution,
    degree: edu.degree ?? undefined,
    field_of_study: edu.field_of_study ?? undefined,
    start_date: edu.start_date,
    end_date: edu.end_date,
    description: edu.description ?? undefined,
    sort_order: edu.sort_order,
  }))

  const projects: Project[] = (projRes.data || []).map((proj) => ({
    id: proj.id,
    cv_id: proj.cv_id,
    name: proj.name,
    description: proj.description ?? undefined,
    project_url: proj.project_url ?? undefined,
    start_date: proj.start_date,
    end_date: proj.end_date,
    sort_order: proj.sort_order,
  }))

  const certifications: Certification[] = (certRes.data || []).map((cert) => ({
    id: cert.id,
    cv_id: cert.cv_id,
    name: cert.name,
    issuer: cert.issuer ?? undefined,
    issue_date: cert.issue_date,
    credential_url: cert.credential_url ?? undefined,
    sort_order: cert.sort_order,
  }))

  return {
    id: cv.id,
    user_id: cv.user_id,
    name: cv.name,
    template: (cv.template as CVTemplate) || 'professional',
    personal_info: (cv.personal_info as unknown as PersonalInfo) || { full_name: '', email: '' },
    summary: cv.summary,
    skills: Array.isArray(cv.skills) ? (cv.skills as string[]) : [],
    created_at: cv.created_at,
    updated_at: cv.updated_at,
    experiences,
    educations,
    projects,
    certifications,
  }
}
