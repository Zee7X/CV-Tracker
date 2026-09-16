'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import type { JobApplicationWithCV, ApplicationStatus } from '@/types/application'
import { APPLICATION_STATUSES } from '@/types/application'
import { ApplicationCard } from './application-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Search,
  X,
  Plus,
  Briefcase,
  Sparkles,
  Filter,
} from 'lucide-react'

interface ApplicationListProps {
  initialApplications: JobApplicationWithCV[]
}

export function ApplicationList({ initialApplications }: ApplicationListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | 'all'>('all')

  // Calculate status counts based on total applications
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: initialApplications.length }
    APPLICATION_STATUSES.forEach((s) => {
      counts[s.value] = 0
    })
    initialApplications.forEach((app) => {
      if (counts[app.status] !== undefined) {
        counts[app.status]++
      }
    })
    return counts
  }, [initialApplications])

  // Filter applications by search term and status
  const filteredApplications = useMemo(() => {
    return initialApplications.filter((app) => {
      // Status filter
      if (selectedStatus !== 'all' && app.status !== selectedStatus) {
        return false
      }

      // Search filter (company name, position, notes)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim()
        const matchCompany = app.company_name.toLowerCase().includes(term)
        const matchPosition = app.position.toLowerCase().includes(term)
        const matchNotes = app.notes?.toLowerCase().includes(term) ?? false
        if (!matchCompany && !matchPosition && !matchNotes) {
          return false
        }
      }

      return true
    })
  }, [initialApplications, selectedStatus, searchTerm])

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedStatus('all')
  }

  // Entire empty state (User has no applications at all)
  if (initialApplications.length === 0) {
    return (
      <div className="rounded-lg border border-stone-300 bg-[#fffefa] p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Briefcase className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900">No Job Applications Yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
          Start organizing your job search. Log applied positions, track interview stages, link tailored CVs, and monitor your progress.
        </p>
        <div className="mt-6">
          <Link href="/dashboard/applications/new">
            <Button size="lg" className="gap-2">
              <Sparkles className="h-5 w-5" />
              Add Your First Application
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <Input
            type="text"
            placeholder="Search by company, position, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9"
            aria-label="Search applications"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus-visible:outline-none"
              aria-label="Clear search query"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Add Application Button */}
        <Link href="/dashboard/applications/new" className="shrink-0">
          <Button className="w-full gap-2 sm:w-auto">
            <Plus className="h-4 w-4" />
            Add Application
          </Button>
        </Link>
      </div>

      {/* Status Filter Tabs / Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
        <span className="mr-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <Filter className="h-3.5 w-3.5" />
          Status:
        </span>

        {/* All Tab */}
        <button
          type="button"
          onClick={() => setSelectedStatus('all')}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:py-1 ${
            selectedStatus === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }`}
          aria-pressed={selectedStatus === 'all'}
        >
          <span>All</span>
          <span
            className={`rounded-full px-1.5 py-0.5 text-[10px] ${
              selectedStatus === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {statusCounts.all}
          </span>
        </button>

        {/* Status Option Tabs */}
        {APPLICATION_STATUSES.map((status) => {
          const count = statusCounts[status.value] || 0
          const isSelected = selectedStatus === status.value
          return (
            <button
              key={status.value}
              type="button"
              onClick={() => setSelectedStatus(status.value)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:py-1 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
              aria-pressed={isSelected}
            >
              <span>{status.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  isSelected ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Filtered List Results */}
      {filteredApplications.length === 0 ? (
        /* Filter / Search yielded no results */
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">No matching applications</h3>
          <p className="mt-1 text-xs text-slate-500">
            No applications matched your search or status filters.
          </p>
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="gap-1.5"
            >
              <X className="h-3.5 w-3.5" />
              Clear Filters
            </Button>
          </div>
        </div>
      ) : (
        /* Applications Grid */
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredApplications.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </div>
      )}
    </div>
  )
}
