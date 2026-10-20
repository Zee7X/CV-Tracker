import Link from 'next/link'
import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserCVs } from '@/lib/cv/queries'
import { EmptyState, PageHeader } from '@/components/layout/page-header'
import { CVCard } from '@/components/cv/editor/cv-card'
import { ButtonLink } from '@/components/ui/button-link'
import { FileText, Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CVListPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const cvs = await getUserCVs()

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="CVs"
          description="Keep one version per kind of role. Duplicate a CV to tailor it without losing the original."
          actions={
            cvs.length > 0 ? (
              <ButtonLink href="/dashboard/cv/new">
                <Plus className="h-4 w-4" aria-hidden="true" />
                New CV
              </ButtonLink>
            ) : undefined
          }
        />

        {cvs.length > 0 ? (
          <p className="text-sm text-stone-500">
            <span data-no-translate>{cvs.length}</span> <span>{cvs.length === 1 ? 'CV' : 'CVs'}</span>
            <span aria-hidden="true"> · </span>
            <span>Sorted by last edit</span>
          </p>
        ) : null}

        {cvs.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-6 w-6" aria-hidden="true" />}
            title="No CVs yet"
            description="Start with your contact details and most recent job. The preview updates as you type, and you can download a PDF at any point."
            action={
              <ButtonLink href="/dashboard/cv/new">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Create your first CV
              </ButtonLink>
            }
          />
        ) : (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {cvs.map((cv) => (
              <li key={cv.id}>
                <CVCard cv={cv} />
              </li>
            ))}
            <li>
              <Link
                href="/dashboard/cv/new"
                className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-stone-300 px-6 py-8 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-700 ring-1 ring-stone-200">
                  <Plus className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold text-stone-900">New CV</span>
                <span className="max-w-[220px] text-xs leading-5 text-stone-500">Start blank, or duplicate an existing CV to tailor it for one role.</span>
              </Link>
            </li>
          </ul>
        )}
      </div>
    </>
  )
}
