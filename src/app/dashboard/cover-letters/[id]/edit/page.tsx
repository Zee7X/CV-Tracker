import React from 'react'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCoverLetterById } from '@/lib/cover-letter/queries'
import { getUserCVs } from '@/lib/cv/queries'
import DashboardShell from '@/components/layout/dashboard-shell'
import { CoverLetterForm } from '@/components/cover-letter/cover-letter-form'

export const dynamic = 'force-dynamic'

interface EditCoverLetterPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: EditCoverLetterPageProps) {
  const { id } = await params
  const letter = await getCoverLetterById(id)
  return {
    title: letter ? `Edit: ${letter.title} - CV Tracker` : 'Edit Cover Letter - CV Tracker',
  }
}

export default async function EditCoverLetterPage({ params }: EditCoverLetterPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const letter = await getCoverLetterById(id)
  if (!letter) {
    notFound()
  }

  const cvs = await getUserCVs()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle()

  const userProfile = {
    full_name: profile?.full_name ?? user.user_metadata?.full_name ?? null,
    email: user.email ?? '',
  }

  return (
    <DashboardShell>
      <CoverLetterForm
        initialData={letter}
        availableCVs={cvs}
        userProfile={userProfile}
      />
    </DashboardShell>
  )
}

