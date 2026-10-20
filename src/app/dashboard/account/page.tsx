import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/page-header'
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
    <>
      <div className="space-y-6">
        <PageHeader title="Account" description="Your profile photo, name and password." />

        <AccountSettingsForm initialProfile={initialProfile} />
      </div>
    </>
  )
}
