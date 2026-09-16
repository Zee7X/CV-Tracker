/**
 * Safe environment configuration for CV Tracker.
 * Fails safely when environment variables are not yet configured.
 */

export function resolveSupabasePublicKey(publishableKey?: string, anonKey?: string) {
  return publishableKey || anonKey || ''
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseKey = resolveSupabasePublicKey(
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export const env = {
  supabaseUrl,
  supabaseKey,
  isConfigured: Boolean(
    supabaseUrl &&
    supabaseKey &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    supabaseUrl !== 'https://placeholder.supabase.co'
  ),
} as const
