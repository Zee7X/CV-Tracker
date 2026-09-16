'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { cvSchema, type CVInput } from '@/lib/validations/cv'

export type ActionResult<T = unknown> =
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: never }

const sanitize = (str?: string | null): string | null => {
  if (typeof str !== 'string') return null
  const trimmed = str.trim()
  return trimmed === '' ? null : trimmed
}

// Row mappers shared by createCV/updateCV to build the RPC's jsonb payloads.
const toExperienceRows = (rows: CVInput['experiences']) =>
  rows.map((exp, idx) => ({
    company: exp.company.trim(),
    position: exp.position.trim(),
    location: sanitize(exp.location),
    start_date: exp.start_date.trim(),
    end_date: exp.is_current ? null : sanitize(exp.end_date),
    is_current: Boolean(exp.is_current),
    description: sanitize(exp.description),
    sort_order: typeof exp.sort_order === 'number' ? exp.sort_order : idx,
  }))

const toEducationRows = (rows: CVInput['educations']) =>
  rows.map((edu, idx) => ({
    institution: edu.institution.trim(),
    degree: sanitize(edu.degree),
    field_of_study: sanitize(edu.field_of_study),
    start_date: sanitize(edu.start_date),
    end_date: sanitize(edu.end_date),
    description: sanitize(edu.description),
    sort_order: typeof edu.sort_order === 'number' ? edu.sort_order : idx,
  }))

const toProjectRows = (rows: CVInput['projects']) =>
  rows.map((proj, idx) => ({
    name: proj.name.trim(),
    description: sanitize(proj.description),
    project_url: sanitize(proj.project_url),
    start_date: sanitize(proj.start_date),
    end_date: sanitize(proj.end_date),
    sort_order: typeof proj.sort_order === 'number' ? proj.sort_order : idx,
  }))

const toCertificationRows = (rows: CVInput['certifications']) =>
  rows.map((cert, idx) => ({
    name: cert.name.trim(),
    issuer: sanitize(cert.issuer),
    issue_date: sanitize(cert.issue_date),
    credential_url: sanitize(cert.credential_url),
    sort_order: typeof cert.sort_order === 'number' ? cert.sort_order : idx,
  }))

/**
 * Creates a new CV with child relations.
 */
export async function createCV(input: CVInput): Promise<ActionResult<{ id: string }>> {
  const parsed = cvSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid CV data' }
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Unauthorized. Please sign in to create a CV.' }
  }

  const validData = parsed.data

  // Single RPC call: the DB function performs parent + all child inserts
  // inside one implicit transaction, so a child failure rolls back the
  // whole CV instead of leaving a partially-written aggregate.
  const { data: cvId, error: rpcError } = await supabase.rpc('create_cv_with_relations', {
    p_name: validData.name.trim(),
    p_template: validData.template,
    p_personal_info: {
      full_name: validData.personal_info.full_name.trim(),
      email: validData.personal_info.email.trim(),
      professional_title: sanitize(validData.personal_info.professional_title) ?? undefined,
      phone: sanitize(validData.personal_info.phone) ?? undefined,
      location: sanitize(validData.personal_info.location) ?? undefined,
      linkedin: sanitize(validData.personal_info.linkedin) ?? undefined,
      github: sanitize(validData.personal_info.github) ?? undefined,
      portfolio: sanitize(validData.personal_info.portfolio) ?? undefined,
      photo_url: sanitize(validData.personal_info.photo_url) ?? undefined,
    },
    p_summary: sanitize(validData.summary),
    p_skills: validData.skills.map((s) => s.trim()).filter(Boolean),
    p_experiences: toExperienceRows(validData.experiences),
    p_educations: toEducationRows(validData.educations),
    p_projects: toProjectRows(validData.projects),
    p_certifications: toCertificationRows(validData.certifications),
  })

  if (rpcError || !cvId) {
    return { success: false, error: rpcError?.message ?? 'Failed to create CV' }
  }

  revalidatePath('/dashboard/cv')
  revalidatePath('/dashboard')

  return { success: true, data: { id: cvId } }
}

/**
 * Updates an existing CV and synchronizes its child relations.
 */
export async function updateCV(id: string, input: CVInput): Promise<ActionResult<{ id: string }>> {
  const parsed = cvSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid CV data' }
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Unauthorized. Please sign in to update CV.' }
  }

  const validData = parsed.data

  // Single RPC call: update + delete + re-insert of children run inside
  // one implicit transaction, so a mid-sync failure rolls back the delete
  // instead of leaving the CV with lost child data.
  const { data: updatedId, error: rpcError } = await supabase.rpc('update_cv_with_relations', {
    p_cv_id: id,
    p_name: validData.name.trim(),
    p_template: validData.template,
    p_personal_info: {
      full_name: validData.personal_info.full_name.trim(),
      email: validData.personal_info.email.trim(),
      professional_title: sanitize(validData.personal_info.professional_title) ?? undefined,
      phone: sanitize(validData.personal_info.phone) ?? undefined,
      location: sanitize(validData.personal_info.location) ?? undefined,
      linkedin: sanitize(validData.personal_info.linkedin) ?? undefined,
      github: sanitize(validData.personal_info.github) ?? undefined,
      portfolio: sanitize(validData.personal_info.portfolio) ?? undefined,
      photo_url: sanitize(validData.personal_info.photo_url) ?? undefined,
    },
    p_summary: sanitize(validData.summary),
    p_skills: validData.skills.map((s) => s.trim()).filter(Boolean),
    p_experiences: toExperienceRows(validData.experiences),
    p_educations: toEducationRows(validData.educations),
    p_projects: toProjectRows(validData.projects),
    p_certifications: toCertificationRows(validData.certifications),
  })

  if (rpcError || !updatedId) {
    return { success: false, error: rpcError?.message ?? 'Failed to update CV or CV not found' }
  }

  revalidatePath('/dashboard/cv')
  revalidatePath(`/dashboard/cv/${id}`)
  revalidatePath('/dashboard')

  return { success: true, data: { id } }
}

/**
 * Deletes a CV owned by the authenticated user.
 */
export async function deleteCV(id: string): Promise<ActionResult<void>> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Unauthorized. Please sign in.' }
  }

  const { error } = await supabase
    .from('cvs')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/cv')
  revalidatePath('/dashboard')

  return { success: true, data: undefined }
}

/**
 * Duplicates a CV including all child relations.
 */
export async function duplicateCV(id: string): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Unauthorized. Please sign in.' }
  }

  // Single RPC call: the DB function re-verifies source ownership and
  // performs the source fetch + new CV insert + all child copies inside
  // one implicit transaction, so a failure partway through can't leave
  // an orphaned duplicate with missing child sections.
  const { data: newCvId, error: rpcError } = await supabase.rpc('duplicate_cv_with_relations', {
    p_source_cv_id: id,
  })

  if (rpcError || !newCvId) {
    return { success: false, error: rpcError?.message ?? 'Failed to duplicate CV.' }
  }

  revalidatePath('/dashboard/cv')
  revalidatePath('/dashboard')

  return { success: true, data: { id: newCvId } }
}
