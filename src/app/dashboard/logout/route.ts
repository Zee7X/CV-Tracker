import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  // Works without a session too (an expired tab), so the user always lands on /login.
  await supabase.auth.signOut()

  // 303 so the browser follows with GET. redirect() from a route handler sends
  // 307, which would repeat the POST against the login page.
  return NextResponse.redirect(new URL('/login', request.url), 303)
}

// Opening the URL directly (refresh, bookmark, history) must not sign anyone
// out, since a GET can be triggered by any page. Send them to the dashboard,
// which in turn asks signed-out visitors to log in.
export function GET(request: NextRequest) {
  return NextResponse.redirect(new URL('/dashboard', request.url), 303)
}
