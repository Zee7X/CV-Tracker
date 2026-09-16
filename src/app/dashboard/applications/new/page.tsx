import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserCVs } from '@/lib/cv/queries'
import DashboardShell from '@/components/layout/dashboard-shell'
import { ApplicationForm } from '@/components/applications/application-form'

export const dynamic = 'force-dynamic'

export default async function NewApplicationPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const cvs = await getUserCVs()

  return (
    <DashboardShell>
      <div className="mx-auto max-w-3xl">
        <ApplicationForm userCVs={cvs} />
      </div>
    </DashboardShell>
  )
}
