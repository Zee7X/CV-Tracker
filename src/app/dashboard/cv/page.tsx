import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserCVs } from '@/lib/cv/queries'
import { EmptyState, PageHeader } from '@/components/layout/page-header'
import { CVCard } from '@/components/cv/editor/cv-card'
import { ButtonLink } from '@/components/ui/button-link'
import { Plus } from 'lucide-react'

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

        {cvs.length === 0 ? (
          <EmptyState
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
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cvs.map((cv) => (
              <li key={cv.id}>
                <CVCard cv={cv} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
