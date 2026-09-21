import { createClient } from '@/lib/supabase/server'
import type { CoverLetter } from '@/types/cover-letter'

/**
 * Fetch all cover letters belonging to the currently authenticated user.
 * Catches missing table error gracefully if migration has not been applied yet.
 */
export async function getUserCoverLetters(): Promise<CoverLetter[]> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
      .from('cover_letters' as any)
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      console.warn('getUserCoverLetters warning:', error.message)
      return []
    }

    return (data as unknown as CoverLetter[]) ?? []
  } catch (err) {
    console.error('Failed to get user cover letters:', err)
    return []
  }
}

/**
 * Fetch a single cover letter by ID.
 */
export async function getCoverLetterById(id: string): Promise<CoverLetter | null> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase
      .from('cover_letters' as any)
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !data) return null

    return data as unknown as CoverLetter
  } catch {
    return null
  }
}

