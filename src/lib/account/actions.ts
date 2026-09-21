'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type AccountActionResult = {
  success?: string
  error?: string
}

export async function updateAccountProfileAction(
  _prevState: AccountActionResult | undefined,
  formData: FormData
): Promise<AccountActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'You must be signed in to update your profile.' }
  }

  const rawFullName = formData.get('full_name')?.toString().trim() ?? ''
  const rawAvatarUrl = formData.get('avatar_url')?.toString().trim() ?? ''

  if (rawFullName && rawFullName.length < 2) {
    return { error: 'Full name must be at least 2 characters.' }
  }

  try {
    // 1. Update public.profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: rawFullName || null,
        avatar_url: rawAvatarUrl || null,
        updated_at: new Date().toISOString(),
      })

    if (profileError) {
      return { error: `Failed to update profile: ${profileError.message}` }
    }

    // 2. Also keep auth user metadata in sync
    await supabase.auth.updateUser({
      data: {
        full_name: rawFullName || null,
        avatar_url: rawAvatarUrl || null,
      },
    })

    revalidatePath('/dashboard/account')
    return { success: 'Profile updated successfully!' }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'An unexpected error occurred while updating profile.',
    }
  }
}

export async function updateAccountPasswordAction(
  _prevState: AccountActionResult | undefined,
  formData: FormData
): Promise<AccountActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'You must be signed in to change your password.' }
  }

  const password = formData.get('password')?.toString() ?? ''
  const confirmPassword = formData.get('confirm_password')?.toString() ?? ''

  if (!password || password.length < 8) {
    return { error: 'Password must be at least 8 characters long.' }
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' }
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: error.message || 'Failed to update password.' }
  }

  revalidatePath('/dashboard/account')
  return { success: 'Password updated successfully!' }
}

