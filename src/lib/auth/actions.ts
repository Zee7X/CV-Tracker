'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema, isSafeRedirect } from './schemas'

export type ActionResult = { error: string } | { success: string }

export async function loginAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  }
  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    // Generic message — never reveal whether email exists
    return { error: 'Invalid email or password.' }
  }

  const next = formData.get('next')
  const safeNext = typeof next === 'string' && isSafeRedirect(next) ? next : '/dashboard'
  redirect(safeNext)
}

export async function registerAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    full_name: formData.get('full_name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirm_password: formData.get('confirm_password'),
  }
  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      // full_name goes into user_metadata; the DB trigger reads it to create the profile
      data: { full_name: parsed.data.full_name },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    console.error('[auth] Sign-up failed:', error.message)
    const message = error.message.toLowerCase()
    if (message.includes('rate limit')) return { error: 'Too many attempts. Please wait a moment and try again.' }
    if (message.includes('password')) return { error: error.message }
    if (message.includes('database')) return { error: 'Account setup failed. Make sure the Supabase migrations have been applied.' }
    return { error: 'Could not create account. Please try again.' }
  }

  if (data.session) redirect('/dashboard')

  // Email confirmation required — inform user without leaking existence
  return { success: 'Check your email for a confirmation link.' }
}

export async function forgotPasswordAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const raw = { email: formData.get('email') }
  const parsed = forgotPasswordSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid email' }
  }

  const supabase = await createClient()
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  })

  // Always succeed — prevents email enumeration
  return { success: 'If that address is registered, you will receive a reset email shortly.' }
}

export async function resetPasswordAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    password: formData.get('password'),
    confirm_password: formData.get('confirm_password'),
  }
  const parsed = resetPasswordSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })

  if (error) {
    return { error: 'Failed to update password. The reset link may have expired.' }
  }

  redirect('/dashboard')
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
