'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { coverLetterSchema } from '@/lib/validations/cover-letter'
import type { CoverLetter, CoverLetterInput } from '@/types/cover-letter'

export async function createCoverLetter(
  input: CoverLetterInput
): Promise<{ success: boolean; id?: string; error?: string }> {
  const parsed = coverLetterSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'You must be signed in to create a cover letter.' }
  }

  const payload = {
    user_id: user.id,
    title: parsed.data.title,
    template: parsed.data.template,
    job_title: parsed.data.job_title,
    company_name: parsed.data.company_name,
    company_address: parsed.data.company_address || null,
    recipient_name: parsed.data.recipient_name || null,
    source: parsed.data.source || null,
    letter_date: parsed.data.letter_date,
    sender_name: parsed.data.sender_name,
    sender_email: parsed.data.sender_email,
    sender_phone: parsed.data.sender_phone || null,
    sender_location: parsed.data.sender_location || null,
    opening: parsed.data.opening,
    body: parsed.data.body,
    closing: parsed.data.closing,
    cv_id: parsed.data.cv_id || null,
  }

  const { data, error } = await supabase
    .from('cover_letters' as any)
    .insert(payload)
    .select('id')
    .single()

  if (error) {
    if (error.code === '42P01') {
      return {
        success: false,
        error:
          'Tabel "cover_letters" belum dibuat di database Supabase. Silakan jalankan script SQL migrasi di Supabase SQL Editor.',
      }
    }
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/cover-letters')
  return { success: true, id: (data as any)?.id }
}

export async function updateCoverLetter(
  id: string,
  input: CoverLetterInput
): Promise<{ success: boolean; error?: string }> {
  const parsed = coverLetterSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'You must be signed in to update a cover letter.' }
  }

  const payload = {
    title: parsed.data.title,
    template: parsed.data.template,
    job_title: parsed.data.job_title,
    company_name: parsed.data.company_name,
    company_address: parsed.data.company_address || null,
    recipient_name: parsed.data.recipient_name || null,
    source: parsed.data.source || null,
    letter_date: parsed.data.letter_date,
    sender_name: parsed.data.sender_name,
    sender_email: parsed.data.sender_email,
    sender_phone: parsed.data.sender_phone || null,
    sender_location: parsed.data.sender_location || null,
    opening: parsed.data.opening,
    body: parsed.data.body,
    closing: parsed.data.closing,
    cv_id: parsed.data.cv_id || null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('cover_letters' as any)
    .update(payload)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/cover-letters')
  revalidatePath(`/dashboard/cover-letters/${id}/edit`)
  return { success: true }
}

export async function deleteCoverLetter(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'You must be signed in.' }
  }

  const { error } = await supabase
    .from('cover_letters' as any)
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/cover-letters')
  return { success: true }
}

export async function duplicateCoverLetter(
  id: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'You must be signed in.' }
  }

  const { data: original, error: fetchError } = await supabase
    .from('cover_letters' as any)
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !original) {
    return { success: false, error: 'Cover letter not found' }
  }

  const orig = original as unknown as CoverLetter
  const payload = {
    user_id: user.id,
    title: `${orig.title} (Copy)`,
    template: orig.template,
    job_title: orig.job_title,
    company_name: orig.company_name,
    company_address: orig.company_address,
    recipient_name: orig.recipient_name,
    source: orig.source,
    letter_date: orig.letter_date,
    sender_name: orig.sender_name,
    sender_email: orig.sender_email,
    sender_phone: orig.sender_phone,
    sender_location: orig.sender_location,
    opening: orig.opening,
    body: orig.body,
    closing: orig.closing,
    cv_id: orig.cv_id,
  }

  const { data, error: insertError } = await supabase
    .from('cover_letters' as any)
    .insert(payload)
    .select('id')
    .single()

  if (insertError) {
    return { success: false, error: insertError.message }
  }

  revalidatePath('/dashboard/cover-letters')
  return { success: true, id: (data as any)?.id }
}
