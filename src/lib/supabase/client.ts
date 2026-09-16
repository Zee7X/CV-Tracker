import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'
import { env } from '@/lib/env'

const FALLBACK_URL = 'https://placeholder.supabase.co'
const FALLBACK_ANON_KEY = 'placeholder-anon-key'

/**
 * Creates a browser-side Supabase client.
 * Persists session state automatically in cookies.
 */
export function createClient() {
  const supabaseUrl = env.supabaseUrl || FALLBACK_URL
  const supabaseKey = env.supabaseKey || FALLBACK_ANON_KEY

  return createBrowserClient<Database>(supabaseUrl, supabaseKey)
}
