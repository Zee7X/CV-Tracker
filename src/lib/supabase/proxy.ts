import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'
import { env } from '@/lib/env'

/**
 * Refreshes auth sessions and enforces route protection.
 * Follows Next.js 16 proxy convention and Supabase SSR guidelines.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const { supabaseUrl, supabaseKey } = env

  // Safe pass-through if environment variables are unconfigured
  if (
    !supabaseUrl ||
    !supabaseKey ||
    supabaseUrl === 'https://your-project.supabase.co' ||
    supabaseUrl === 'https://placeholder.supabase.co'
  ) {
    return supabaseResponse
  }

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: auth.getUser() refreshes the token and validates the user securely
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isDashboardRoute = pathname.startsWith('/dashboard')
  const isAuthRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password')

  // The logout route works with or without a session (it always ends on /login),
  // so it is never bounced here.
  const isLogoutRoute = pathname === '/dashboard/logout'
  const isPageRequest = request.method === 'GET' || request.method === 'HEAD'
  // Server action calls are fetches, not navigations. Each action checks the
  // session itself and returns a "please sign in" error the form can show.
  const isServerAction = request.headers.has('next-action')

  if (!user && isDashboardRoute && !isLogoutRoute && !isServerAction) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.search = ''
    // Bring the user back to the page they asked for after signing in. Only
    // for page views: a form POST cannot be replayed from the login page.
    if (isPageRequest) redirectUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`)
    // 303 makes the browser follow with GET. The default 307 would repeat a
    // POST against /login, which only serves GET (HTTP 405).
    return NextResponse.redirect(redirectUrl, isPageRequest ? 307 : 303)
  }

  // Signed-in users skip the sign-in pages. Page views only: a login form
  // submitted from a stale tab still reaches its server action.
  if (user && isAuthRoute && isPageRequest) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}
