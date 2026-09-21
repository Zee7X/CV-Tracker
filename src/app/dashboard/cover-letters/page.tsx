import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserCoverLetters } from '@/lib/cover-letter/queries'
import DashboardShell from '@/components/layout/dashboard-shell'
import { CoverLetterCard } from '@/components/cover-letter/cover-letter-card'
import { Button } from '@/components/ui/button'
import { Plus, Mail, Sparkles } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Cover Letters - CV Tracker',
}

export default async function CoverLettersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const letters = await getUserCoverLetters()

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Cover Letters</h1>
            <p className="text-sm text-slate-600">
              Create and manage customized cover letters and email templates for your job applications.
            </p>
          </div>
          <Link href="/dashboard/cover-letters/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Cover Letter
            </Button>
          </Link>
        </div>

        {/* Content Section */}
        {letters.length === 0 ? (
          /* Empty State */
          <div className="rounded-lg border border-stone-300 bg-[#fffefa] p-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-md bg-blue-100 text-blue-900">
              <Mail className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">No Cover Letters Yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              Pick a template (Formal Indonesia, Professional English, or Email Body), import your CV details, and create a ready-to-send application letter.
            </p>
            <div className="mt-6">
              <Link href="/dashboard/cover-letters/new">
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Create Your First Cover Letter
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Grid of Cover Letters */
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {letters.map((letter) => (
              <CoverLetterCard key={letter.id} letter={letter} />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
