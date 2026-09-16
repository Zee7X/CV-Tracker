import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/layout/dashboard-shell'

export default async function AccountPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Account</h1>
          <p className="text-slate-600">Manage your account settings.</p>
        </div>

        {/* Empty State */}
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0c-1 1.248-3 2-5 2m14 0c1.248 0 3-.752 4-2" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Account Settings</h2>
          <p className="mt-2 text-slate-600">Your account information and preferences.</p>
        </div>
      </div>
    </DashboardShell>
  )
}
