import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isSafeRedirect } from '@/lib/auth/schemas'

export async function GET(request: NextRequest) {
  const url = request.nextUrl
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/dashboard'
  const safeNext = isSafeRedirect(next) ? next : '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Build absolute redirect to avoid open-redirect via Host spoofing
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = safeNext
      redirectUrl.search = ''
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Code missing or exchange failed — send to login with error param
  const errorUrl = request.nextUrl.clone()
  errorUrl.pathname = '/login'
  errorUrl.search = '?error=auth_callback_failed'
  return NextResponse.redirect(errorUrl)
}
