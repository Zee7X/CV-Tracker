'use client'

import React, { useMemo, useState } from 'react'
import type { JobApplicationWithCV, ApplicationStatus } from '@/types/application'
import { APPLICATION_STATUSES } from '@/types/application'
import { ApplicationCard } from './application-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import { EmptyState } from '@/components/layout/page-header'
import { BriefcaseBusiness, Plus, Search, X } from 'lucide-react'

interface ApplicationListProps {
  initialApplications: JobApplicationWithCV[]
  initialStatus?: ApplicationStatus | 'all'
}

export function ApplicationList({ initialApplications, initialStatus = 'all' }: ApplicationListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | 'all'>(initialStatus)

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: initialApplications.length }
    for (const status of APPLICATION_STATUSES) counts[status.value] = 0
    for (const app of initialApplications) counts[app.status] = (counts[app.status] ?? 0) + 1
    return counts
  }, [initialApplications])

  const filteredApplications = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    return initialApplications
      .filter((app) => selectedStatus === 'all' || app.status === selectedStatus)
      .filter(
        (app) =>
          !term ||
          app.company_name.toLowerCase().includes(term) ||
          app.position.toLowerCase().includes(term) ||
          (app.notes?.toLowerCase().includes(term) ?? false)
      )
      .sort((a, b) => (b.applied_date || '').localeCompare(a.applied_date || ''))
  }, [initialApplications, selectedStatus, searchTerm])

  if (initialApplications.length === 0) {
    return (
      <EmptyState
        icon={<BriefcaseBusiness className="h-6 w-6" aria-hidden="true" />}
        title="No applications yet"
        description="Log each job you apply to with the CV you sent, the posting link and the current stage. You will see what needs a follow-up at a glance."
        action={
          <ButtonLink href="/dashboard/applications/new">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add your first application
          </ButtonLink>
        }
      />
    )
  }

  const filters: { value: ApplicationStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    ...APPLICATION_STATUSES.map((status) => ({ value: status.value, label: status.label })),
  ]

  return (
    <div className="overflow-hidden rounded-3xl glass">
      <div className="flex flex-col gap-3 border-b border-stone-900/[0.06] px-4 pt-4 sm:px-5">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
          <Input
            type="search"
            placeholder="Search company, position or notes"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="pl-9"
            aria-label="Search applications"
          />
        </div>

        <div className="scrollbar-none -mx-1 overflow-x-auto px-1">
          <div role="tablist" aria-label="Filter by status" className="flex min-w-max gap-1">
            {filters.map((filter) => {
              const selected = selectedStatus === filter.value
              const count = statusCounts[filter.value] ?? 0
              return (
                <button
                  key={filter.value}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setSelectedStatus(filter.value)}
                  className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-700 ${
                    selected
                      ? 'border-brand-700 text-stone-900'
                      : 'border-transparent text-stone-500 hover:border-stone-900/10 hover:text-stone-900'
                  }`}
                >
                  {filter.label}
                  <span
                    className={`rounded-md px-1.5 py-px text-xs tabular-nums ${selected ? 'bg-brand-50 text-brand-700' : 'bg-stone-900/[0.05] text-stone-500'}`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="hidden grid-cols-[minmax(0,1fr)_minmax(0,200px)_120px_232px] gap-4 border-b border-stone-900/[0.06] bg-white/50/70 px-5 py-2.5 text-xs font-medium text-stone-500 lg:grid">
        <span>Position and company</span>
        <span>CV sent</span>
        <span>Date applied</span>
        <span>Stage</span>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="px-4 py-14 text-center">
          <p className="text-sm font-medium text-stone-800">No applications match these filters.</p>
          <p className="mt-1 text-sm text-stone-500">Try another stage or a shorter search term.</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              setSearchTerm('')
              setSelectedStatus('all')
            }}
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Clear filters
          </Button>
        </div>
      ) : (
        <ul className="divide-y divide-stone-900/[0.06]">
          {filteredApplications.map((app) => (
            <li key={app.id}>
              <ApplicationCard application={app} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
