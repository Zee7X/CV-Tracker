import Link from 'next/link'
import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserCoverLetters } from '@/lib/cover-letter/queries'
import { EmptyState, PageHeader } from '@/components/layout/page-header'
import { CoverLetterCard } from '@/components/cover-letter/cover-letter-card'
import { ButtonLink } from '@/components/ui/button-link'
import { Mail, Plus } from 'lucide-react'

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
            icon={<Mail className="h-6 w-6" aria-hidden="true" />}
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
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {letters.map((letter) => (
              <li key={letter.id}>
                <CoverLetterCard letter={letter} />
              </li>
            ))}
            <li>
              <Link
                href="/dashboard/cover-letters/new"
                className="flex h-full min-h-[180px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-stone-900/10 px-6 py-8 text-center transition-colors hover:border-brand-400 hover:bg-brand-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-700 ring-1 ring-stone-200">
                  <Plus className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold text-stone-900">New cover letter</span>
                <span className="max-w-[220px] text-xs leading-5 text-stone-500">Pick a format, then fill it from one of your CVs.</span>
              </Link>
            </li>
          </ul>
        )}
      </div>
    </>
  )
}
