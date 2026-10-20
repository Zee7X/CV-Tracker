import React from 'react'
import Link from 'next/link'
import type { CV } from '@/types/cv'
import { TEMPLATE_NAMES } from '@/lib/format'
import { LocalDate } from '@/components/i18n/local-date'
import { ButtonLink } from '@/components/ui/button-link'

interface RecentCVsProps {
  cvs: CV[]
}

export function RecentCVs({ cvs }: RecentCVsProps) {
  return (
    <section className="rounded-lg border border-stone-300 bg-white" aria-labelledby="recent-cvs-title">
      <header className="flex items-center justify-between border-b border-stone-200 px-5 py-3">
        <h2 id="recent-cvs-title" className="text-base font-semibold text-stone-950">
          Recently edited CVs
        </h2>
        {cvs.length > 0 ? (
          <Link href="/dashboard/cv" className="text-sm font-medium text-blue-800 underline-offset-4 hover:underline">
            All CVs
          </Link>
        ) : null}
      </header>

      {cvs.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-sm text-stone-700">No CVs yet.</p>
          <p className="mt-1 text-sm text-stone-500">Create one, then attach it to the applications you send.</p>
          <ButtonLink href="/dashboard/cv/new" size="sm" className="mt-4">
            Create CV
          </ButtonLink>
        </div>
      ) : (
        <ul className="divide-y divide-stone-200">
          {cvs.map((cv) => (
            <li key={cv.id}>
              <Link
                href={`/dashboard/cv/${cv.id}`}
                className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-800"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-stone-950" data-no-translate>
                    {cv.name}
                  </span>
                  <span className="block text-xs text-stone-500">
                    <span data-no-translate>{TEMPLATE_NAMES[cv.template] ?? cv.template}</span>
                    <span aria-hidden="true"> · </span>
                    <span>Edited</span> <LocalDate value={cv.updated_at} />
                  </span>
                </span>
                <span className="shrink-0 text-xs font-medium text-stone-600">Edit</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
