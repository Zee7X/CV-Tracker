'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  applicationSchema,
  applicationStatusEnum,
  type ApplicationInput,
} from '@/lib/validations/application'
import type { ApplicationStatus } from '@/types/application'

export type ActionResult<T = unknown> =
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: never }

const sanitize = (str?: string | null): string | null => {
  if (typeof str !== 'string') return null
  const trimmed = str.trim()
  return trimmed === '' ? null : trimmed
}

/**
 * Creates a new job application for the authenticated user.
 */
export async function createApplication(
  input: ApplicationInput
): Promise<ActionResult<{ id: string }>> {
  const parsed = applicationSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid application data',
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Unauthorized. Please sign in to create an application.' }
  }

  const validData = parsed.data
  const cvId = sanitize(validData.cv_id)

  // Verify cv_id ownership if provided
  if (cvId) {
    const { data: cv, error: cvError } = await supabase
      .from('cvs')
      .select('id')
      .eq('id', cvId)
      .eq('user_id', user.id)
      .single()

    if (cvError || !cv) {
      return {
        success: false,
        error: 'Selected CV was not found or is not owned by your account.',
      }
    }
  }

  const { data, error } = await supabase
    .from('job_applications')
    .insert({
      user_id: user.id,
      company_name: validData.company_name.trim(),
      position: validData.position.trim(),
      applied_date: validData.applied_date.trim(),
      status: validData.status,
      cv_id: cvId,
      job_url: sanitize(validData.job_url),
      notes: sanitize(validData.notes),
    })
    .select('id')
    .single()

  if (error || !data) {
    return { success: false, error: error?.message ?? 'Failed to create job application' }
  }

  revalidatePath('/dashboard/applications')
  revalidatePath('/dashboard')

  return { success: true, data: { id: data.id } }
}

/**
 * Updates an existing job application.
 */
export async function updateApplication(
  id: string,
  input: ApplicationInput
): Promise<ActionResult<{ id: string }>> {
  const parsed = applicationSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid application data',
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Unauthorized. Please sign in to update application.' }
  }

  const validData = parsed.data
  const cvId = sanitize(validData.cv_id)

  // Verify cv_id ownership if provided
  if (cvId) {
    const { data: cv, error: cvError } = await supabase
      .from('cvs')
      .select('id')
      .eq('id', cvId)
      .eq('user_id', user.id)
      .single()

    if (cvError || !cv) {
      return {
        success: false,
        error: 'Selected CV was not found or is not owned by your account.',
      }
    }
  }

  const { data, error } = await supabase
    .from('job_applications')
    .update({
      company_name: validData.company_name.trim(),
      position: validData.position.trim(),
      applied_date: validData.applied_date.trim(),
      status: validData.status,
      cv_id: cvId,
      job_url: sanitize(validData.job_url),
      notes: sanitize(validData.notes),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id')
    .single()

  if (error || !data) {
    return {
      success: false,
      error: error?.message ?? 'Failed to update application or application not found',
    }
  }

  revalidatePath('/dashboard/applications')
  revalidatePath(`/dashboard/applications/${id}`)
  revalidatePath('/dashboard')

  return { success: true, data: { id: data.id } }
}

/**
 * Deletes a job application owned by the user.
 */
export async function deleteApplication(id: string): Promise<ActionResult<void>> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Unauthorized. Please sign in.' }
  }

  const { error } = await supabase
    .from('job_applications')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/applications')
  revalidatePath('/dashboard')

  return { success: true, data: undefined }
}

/**
 * Quickly updates the status of an application.
 */
export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus
): Promise<ActionResult<void>> {
  const parsedStatus = applicationStatusEnum.safeParse(status)
  if (!parsedStatus.success) {
    return { success: false, error: 'Invalid application status' }
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Unauthorized. Please sign in.' }
  }

  const { error } = await supabase
    .from('job_applications')
    .update({
      status: parsedStatus.data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/applications')
  revalidatePath(`/dashboard/applications/${id}`)
  revalidatePath('/dashboard')

  return { success: true, data: undefined }
}
