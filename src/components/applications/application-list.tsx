'use client'

import React, { useMemo, useState } from 'react'
import type { JobApplicationWithCV, ApplicationStatus } from '@/types/application'
import { APPLICATION_STATUSES } from '@/types/application'
import { ApplicationCard } from './application-card'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import { EmptyState } from '@/components/layout/page-header'
import { LocalDate } from '@/components/i18n/local-date'
import { BriefcaseBusiness, Filter, Plus, Search, X } from 'lucide-react'

interface ApplicationListProps {
  initialApplications: JobApplicationWithCV[]
  initialStatus?: ApplicationStatus | 'all'
  initialSearch?: string
}

export function ApplicationList({ initialApplications, initialStatus = 'all', initialSearch = '' }: ApplicationListProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearch)
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

  // Group applications by applied date for the EduMate chronological timeline style
  const dateGroups = useMemo(() => {
    const map = new Map<string, JobApplicationWithCV[]>()
    for (const app of filteredApplications) {
      const dateKey = app.applied_date || 'Undated'
      if (!map.has(dateKey)) {
        map.set(dateKey, [])
      }
      map.get(dateKey)!.push(app)
    }
    return Array.from(map.entries())
  }, [filteredApplications])

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
    <div className="space-y-6">
      {/* Controls row matching EduMate: segmented pill filters on left, search and filters on right */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Segmented status pill tabs */}
        <div className="scrollbar-none -mx-1 overflow-x-auto px-1">
          <div role="tablist" aria-label="Filter by status" className="flex min-w-max items-center gap-1.5">
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
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${
                    selected
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'border border-slate-200/90 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {filter.label}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[11px] tabular-nums font-semibold ${
                      selected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right side search bar and filter button */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              placeholder="Filter company or role..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="h-9 w-full rounded-full border border-slate-200 bg-white pl-9 pr-3.5 text-xs text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              aria-label="Search applications"
            />
          </div>
          {searchTerm || selectedStatus !== 'all' ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('')
                setSelectedStatus('all')
              }}
              className="rounded-full"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Reset
            </Button>
          ) : null}
        </div>
      </div>

      {/* List of Applications grouped by Date/Timeline */}
      {filteredApplications.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-xs">
          <p className="text-sm font-semibold text-slate-800">No applications match these filters.</p>
          <p className="mt-1 text-xs text-slate-500">Try selecting another status tab or clearing your search term.</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4 rounded-full"
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
        <div className="space-y-6">
          {dateGroups.map(([dateKey, apps]) => (
            <div key={dateKey} className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <span className="text-sm font-bold text-slate-900">
                  {dateKey === 'Undated' ? (
                    'Unscheduled'
                  ) : (
                    <LocalDate value={dateKey} />
                  )}
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                  {apps.length}
                </span>
              </div>
              <div className="space-y-3">
                {apps.map((app) => (
                  <ApplicationCard key={app.id} application={app} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
