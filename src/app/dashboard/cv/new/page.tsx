import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/layout/dashboard-shell'
import { CVForm } from '@/components/cv/editor/cv-form'

export const dynamic = 'force-dynamic'

export default async function NewCVPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <DashboardShell>
      <div className="mx-auto max-w-5xl">
        <CVForm />
      </div>
    </DashboardShell>
  )
}
