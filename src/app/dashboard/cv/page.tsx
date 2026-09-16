import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserCVs } from '@/lib/cv/queries'
import DashboardShell from '@/components/layout/dashboard-shell'
import { CVCard } from '@/components/cv/editor/cv-card'
import { Button } from '@/components/ui/button'
import { Plus, FileText } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CVListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const cvs = await getUserCVs()

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My CVs</h1>
            <p className="text-sm text-slate-600">
              Create and manage customized versions of your CV for different job roles.
            </p>
          </div>
          <Link href="/dashboard/cv/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create CV
            </Button>
          </Link>
        </div>

        {/* Content Section */}
        {cvs.length === 0 ? (
          /* Empty State */
          <div className="rounded-lg border border-stone-300 bg-[#fffefa] p-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-md bg-blue-100 text-blue-900">
              <FileText className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">No CVs Created Yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              Create your first CV, choose a format, and adjust it for the role you want.
            </p>
            <div className="mt-6">
              <Link href="/dashboard/cv/new">
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Create Your First CV
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Grid of CVs */
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cvs.map((cv) => (
              <CVCard key={cv.id} cv={cv} />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
