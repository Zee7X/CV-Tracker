import { createClient } from '@/lib/supabase/server'
import DashboardShell, { type ShellCounts, type ShellUser } from '@/components/layout/dashboard-shell'

async function count(query: PromiseLike<{ count: number | null; error: unknown }>) {
  const { count: value, error } = await query
  return error ? null : (value ?? 0)
}

// The shell lives in the layout so the sidebar stays mounted while pages and
// their loading states swap underneath it. It also loads what the sidebar
// shows: who is signed in and how many items each section holds.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let shellUser: ShellUser | null = null
  let counts: ShellCounts = { applications: null, cvs: null, letters: null }

  if (user) {
    const head = { count: 'exact' as const, head: true }
    const [profileRes, applications, cvs, letters] = await Promise.all([
      supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).maybeSingle(),
      count(supabase.from('job_applications').select('*', head).eq('user_id', user.id)),
      count(supabase.from('cvs').select('*', head).eq('user_id', user.id)),
      count(supabase.from('cover_letters').select('*', head).eq('user_id', user.id)),
    ])
    shellUser = {
      email: user.email ?? '',
      name: profileRes.data?.full_name || (user.user_metadata?.full_name as string | undefined) || '',
      avatarUrl: profileRes.data?.avatar_url || (user.user_metadata?.avatar_url as string | undefined) || null,
    }
    counts = { applications, cvs, letters }
  }

  return (
    <DashboardShell user={shellUser} counts={counts}>
      {children}
    </DashboardShell>
  )
}
