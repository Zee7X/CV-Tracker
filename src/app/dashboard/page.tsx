import React from 'react'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getOverviewData, summarize } from '@/lib/dashboard/queries'
import { PageHeader } from '@/components/layout/page-header'
import { CVShelf, FollowUps, GettingStarted, Pipeline, RecentApplicationsPanel, StatStrip } from '@/components/dashboard/overview'
import { ButtonLink } from '@/components/ui/button-link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) redirect('/login')

  const data = await getOverviewData()
  const summary = summarize(data.applications)
  const setupDone = data.cvs.length > 0 && data.applications.length > 0 && data.letterCount > 0

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          data.firstName ? (
            <>
              <span>Welcome back</span>, <span data-no-translate>{data.firstName}</span>
            </>
          ) : (
            'Overview'
          )
        }
        description="What needs a reply, where each application stands, and the CVs you send."
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

      {setupDone ? null : (
        <GettingStarted hasCV={data.cvs.length > 0} hasApplication={data.applications.length > 0} hasLetter={data.letterCount > 0} />
      )}

      {summary.total > 0 ? <StatStrip summary={summary} /> : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-6">
          <Pipeline summary={summary} />
          <RecentApplicationsPanel applications={data.applications} />
        </div>
        <div className="min-w-0 space-y-6">
          <FollowUps items={summary.followUps} />
          <CVShelf cvs={data.cvs} letterCount={data.letterCount} />
        </div>
      </div>
    </div>
  )
}
