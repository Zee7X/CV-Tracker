'use client'

import React, { useMemo, useState } from 'react'
import type { JobApplicationWithCV, ApplicationStatus } from '@/types/application'
import { APPLICATION_STATUSES } from '@/types/application'
import { ApplicationCard } from './application-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import { EmptyState } from '@/components/layout/page-header'
import { Plus, Search, X } from 'lucide-react'

interface ApplicationListProps {
  initialApplications: JobApplicationWithCV[]
}

export function ApplicationList({ initialApplications }: ApplicationListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | 'all'>('all')

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
    <div className="space-y-4">
      <div className="relative max-w-md">
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
        <div role="tablist" aria-label="Filter by status" className="flex min-w-max gap-1 border-b border-stone-300">
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
                className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-800 ${
                  selected
                    ? 'border-blue-800 text-stone-950'
                    : 'border-transparent text-stone-600 hover:border-stone-400 hover:text-stone-950'
                }`}
              >
                {filter.label}
                <span className="tabular-nums text-xs text-stone-500">{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stone-300 px-4 py-10 text-center">
          <p className="text-sm text-stone-700">
            No applications match
            {searchTerm.trim() ? <> &quot;{searchTerm.trim()}&quot;</> : null}
            {selectedStatus !== 'all' ? <> in {APPLICATION_STATUSES.find((s) => s.value === selectedStatus)?.label}</> : null}.
          </p>
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
        <ul className="divide-y divide-stone-200 overflow-hidden rounded-lg border border-stone-300 bg-white">
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
