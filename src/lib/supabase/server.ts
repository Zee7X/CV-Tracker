import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'
import { env } from '@/lib/env'

const FALLBACK_URL = 'https://placeholder.supabase.co'
const FALLBACK_ANON_KEY = 'placeholder-anon-key'

/**
 * Creates a server-side Supabase client for Server Components,
 * Server Actions, and Route Handlers in Next.js 16.
 */
export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl = env.supabaseUrl || FALLBACK_URL
  const supabaseKey = env.supabaseKey || FALLBACK_ANON_KEY

  return createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignored when called from Server Components during render.
            // Session refreshing is handled by proxy / middleware.
          }
        },
      },
    }
  )
}
