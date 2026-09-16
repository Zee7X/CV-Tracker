import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getDashboardData } from '@/lib/dashboard/queries'
import DashboardShell from '@/components/layout/dashboard-shell'
import { MetricCards } from '@/components/dashboard/metric-cards'
import { RecentCVs } from '@/components/dashboard/recent-cvs'
import { RecentApplications } from '@/components/dashboard/recent-applications'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Briefcase } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Verify authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Fetch real user-owned dashboard metrics and recent activity
  const data = await getDashboardData(5)

  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* Page Header with Quick Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Dashboard</h1>
            <p className="text-sm text-slate-600">
              Welcome back! Track your job applications and manage your CVs in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/dashboard/cv/new">
              <Button variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                <span>Create CV</span>
              </Button>
            </Link>
            <Link href="/dashboard/applications/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                <Briefcase className="h-4 w-4" />
                <span>Add Application</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Real Metrics Grid */}
        <section aria-label="Dashboard Metrics">
          <MetricCards metrics={data.metrics} />
        </section>

        {/* Recent Activity Grid */}
        <section aria-label="Recent Activity" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RecentCVs cvs={data.recentCVs} />
          <RecentApplications applications={data.recentApplications} />
        </section>
      </div>
    </DashboardShell>
  )
}
