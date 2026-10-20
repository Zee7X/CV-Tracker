import React from 'react'
import Link from 'next/link'
import type { JobApplicationWithCV } from '@/types/application'
import { StatusBadge } from '@/components/applications/status-badge'
import { LocalDate } from '@/components/i18n/local-date'
import { ButtonLink } from '@/components/ui/button-link'

interface RecentApplicationsProps {
  applications: JobApplicationWithCV[]
}

export function RecentApplications({ applications }: RecentApplicationsProps) {
  return (
    <section className="rounded-lg border border-stone-300 bg-white" aria-labelledby="recent-apps-title">
      <header className="flex items-center justify-between border-b border-stone-200 px-5 py-3">
        <h2 id="recent-apps-title" className="text-base font-semibold text-stone-950">
          Latest applications
        </h2>
        {applications.length > 0 ? (
          <Link href="/dashboard/applications" className="text-sm font-medium text-blue-800 underline-offset-4 hover:underline">
            All applications
          </Link>
        ) : null}
      </header>

      {applications.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-sm text-stone-700">No applications logged.</p>
          <p className="mt-1 text-sm text-stone-500">
            Record each job you apply to so you know which CV you sent and when to follow up.
          </p>
          <ButtonLink href="/dashboard/applications/new" size="sm" className="mt-4">
            Add application
          </ButtonLink>
        </div>
      ) : (
        <ul className="divide-y divide-stone-200">
          {applications.map((app) => (
            <li key={app.id}>
              <Link
                href={`/dashboard/applications/${app.id}`}
                className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-800"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-stone-950" data-no-translate>
                    {app.position}
                  </span>
                  <span className="block truncate text-xs text-stone-500">
                    <span data-no-translate>{app.company_name}</span>
                    <span aria-hidden="true"> · </span>
                    <LocalDate value={app.applied_date} />
                  </span>
                </span>
                <StatusBadge status={app.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
