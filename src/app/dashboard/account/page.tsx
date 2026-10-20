import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Panel, PageHeader } from '@/components/layout/page-header'
import { LocalDate } from '@/components/i18n/local-date'
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

  const head = { count: 'exact' as const, head: true }
  const [cvs, applications, letters] = await Promise.all([
    supabase.from('cvs').select('*', head).eq('user_id', user.id),
    supabase.from('job_applications').select('*', head).eq('user_id', user.id),
    supabase.from('cover_letters').select('*', head).eq('user_id', user.id),
  ])

  const usage = [
    { label: 'CVs', value: cvs.count ?? 0, href: '/dashboard/cv' },
    { label: 'Applications', value: applications.count ?? 0, href: '/dashboard/applications' },
    { label: 'Cover letters', value: letters.count ?? 0, href: '/dashboard/cover-letters' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Account" description="Your profile photo, name and password." />

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <AccountSettingsForm initialProfile={initialProfile} />

        <aside className="space-y-4 xl:sticky xl:top-8">
          <Panel title="In your account" bodyClassName="divide-y divide-stone-100">
            {usage.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between px-5 py-3 text-sm transition-colors hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-700"
              >
                <span className="text-stone-700">{item.label}</span>
                <span className="font-semibold tabular-nums text-stone-950" data-no-translate>
                  {item.value}
                </span>
              </Link>
            ))}
          </Panel>
          <Panel title="Signed in as" bodyClassName="space-y-1 px-5 py-4 text-sm">
            <p className="truncate font-medium text-stone-950" data-no-translate>
              {initialProfile.email}
            </p>
            {initialProfile.created_at ? (
              <p className="text-xs text-stone-500">
                <span>Member since</span> <LocalDate value={initialProfile.created_at} />
              </p>
            ) : null}
          </Panel>
        </aside>
      </div>
    </div>
  )
}
