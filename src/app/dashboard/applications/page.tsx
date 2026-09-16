import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserApplications } from './queries'
import DashboardShell from '@/components/layout/dashboard-shell'
import { ApplicationList } from '@/components/applications/application-list'

export const dynamic = 'force-dynamic'

export default async function ApplicationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const applications = await getUserApplications()

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Applications</h1>
          <p className="text-sm text-slate-600">
            Track and manage your job search pipeline across all stages.
          </p>
        </div>

        <ApplicationList initialApplications={applications} />
      </div>
    </DashboardShell>
  )
}
