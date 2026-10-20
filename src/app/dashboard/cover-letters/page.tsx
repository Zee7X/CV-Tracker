import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserCoverLetters } from '@/lib/cover-letter/queries'
import { EmptyState, PageHeader } from '@/components/layout/page-header'
import { CoverLetterCard } from '@/components/cover-letter/cover-letter-card'
import { ButtonLink } from '@/components/ui/button-link'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Cover Letters - CV Tracker',
}

export default async function CoverLettersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const letters = await getUserCoverLetters()

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Cover letters"
          description="Letters and email bodies for specific applications. Fill in your details from a saved CV."
          actions={
            letters.length > 0 ? (
              <ButtonLink href="/dashboard/cover-letters/new">
                <Plus className="h-4 w-4" aria-hidden="true" />
                New cover letter
              </ButtonLink>
            ) : undefined
          }
        />

        {letters.length === 0 ? (
          <EmptyState
            title="No cover letters yet"
            description="Pick a format (formal Indonesian, professional English, or a short email body), import your details from a CV, then edit the text for the job."
            action={
              <ButtonLink href="/dashboard/cover-letters/new">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Write a cover letter
              </ButtonLink>
            }
          />
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {letters.map((letter) => (
              <li key={letter.id}>
                <CoverLetterCard letter={letter} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
