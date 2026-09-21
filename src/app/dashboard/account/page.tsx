import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/layout/dashboard-shell'
import { AccountSettingsForm } from '@/components/account/account-settings-form'

export const metadata = {
  title: 'Account Settings - CV Tracker',
}

export default async function AccountPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch application profile from public.profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, created_at')
    .eq('id', user.id)
    .maybeSingle()

  const initialProfile = {
    id: user.id,
    email: user.email ?? '',
    full_name: profile?.full_name ?? user.user_metadata?.full_name ?? null,
    avatar_url: profile?.avatar_url ?? user.user_metadata?.avatar_url ?? null,
    created_at: profile?.created_at ?? user.created_at ?? null,
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Account</h1>
          <p className="text-slate-600">Manage your profile details and security settings.</p>
        </div>

        <AccountSettingsForm initialProfile={initialProfile} />
      </div>
    </DashboardShell>
  )
}
