import React from 'react'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getApplicationById } from '../queries'
import { getUserCVs } from '@/lib/cv/queries'
import { ApplicationForm } from '@/components/applications/application-form'

export const dynamic = 'force-dynamic'

interface ApplicationDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [application, cvs] = await Promise.all([
    getApplicationById(id),
    getUserCVs(),
  ])

  if (!application) {
    notFound()
  }

  return (
    <>
      <div className="max-w-3xl">
        <ApplicationForm initialData={application} userCVs={cvs} />
      </div>
    </>
  )
}
