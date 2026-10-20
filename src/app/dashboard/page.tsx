import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getDashboardData } from '@/lib/dashboard/queries'
import { PageHeader } from '@/components/layout/page-header'
import { MetricCards } from '@/components/dashboard/metric-cards'
import { RecentCVs } from '@/components/dashboard/recent-cvs'
import { RecentApplications } from '@/components/dashboard/recent-applications'
import { ButtonLink } from '@/components/ui/button-link'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) redirect('/login')

  const data = await getDashboardData(5)

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Overview"
          description="Your latest applications and the CVs you used for them."
          actions={
            <>
              <ButtonLink href="/dashboard/cv/new" variant="outline">
                New CV
              </ButtonLink>
              <ButtonLink href="/dashboard/applications/new">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add application
              </ButtonLink>
            </>
          }
        />

        <section aria-label="Totals">
          <MetricCards metrics={data.metrics} />
        </section>

        {/* Applications are the day-to-day work, so they take the wider column. */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <RecentApplications applications={data.recentApplications} />
          <RecentCVs cvs={data.recentCVs} />
        </div>
      </div>
    </>
  )
}
