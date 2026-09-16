import React from 'react'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCVWithRelations } from '@/lib/cv/queries'
import DashboardShell from '@/components/layout/dashboard-shell'
import { CVForm } from '@/components/cv/editor/cv-form'

export const dynamic = 'force-dynamic'

interface CVDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function CVDetailPage({ params }: CVDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const cv = await getCVWithRelations(id)

  if (!cv) {
    notFound()
  }

  return (
    <DashboardShell>
      <div className="mx-auto max-w-5xl">
        <CVForm initialData={cv} />
      </div>
    </DashboardShell>
  )
}
