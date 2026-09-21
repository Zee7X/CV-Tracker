import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserCVs } from '@/lib/cv/queries'
import DashboardShell from '@/components/layout/dashboard-shell'
import { CoverLetterForm } from '@/components/cover-letter/cover-letter-form'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'New Cover Letter - CV Tracker',
}

export default async function NewCoverLetterPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Load user's CVs for auto-fill
  const cvs = await getUserCVs()

  // Load profile for default sender name
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
      <CoverLetterForm availableCVs={cvs} userProfile={userProfile} />
    </DashboardShell>
  )
}

