import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserApplications } from './queries'
import { PageHeader } from '@/components/layout/page-header'
import { ApplicationList } from '@/components/applications/application-list'
import { ButtonLink } from '@/components/ui/button-link'
import { Plus } from 'lucide-react'
import { APPLICATION_STATUSES, type ApplicationStatus } from '@/types/application'

export const dynamic = 'force-dynamic'

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<{ status?: string; search?: string }> }) {
  const { status, search } = await searchParams
  const initialStatus = APPLICATION_STATUSES.some((item) => item.value === status) ? (status as ApplicationStatus) : 'all'
  const initialSearch = typeof search === 'string' ? search : ''
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const applications = await getUserApplications()

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Applications"
          description="Every job you applied to, the CV you sent, and where it stands."
          actions={
            applications.length > 0 ? (
              <ButtonLink href="/dashboard/applications/new">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add application
              </ButtonLink>
            ) : undefined
          }
        />
        <ApplicationList
          key={`${initialStatus}-${initialSearch}`}
          initialApplications={applications}
          initialStatus={initialStatus}
          initialSearch={initialSearch}
        />
      </div>
    </>
  )
}
