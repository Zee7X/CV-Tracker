'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { JobApplicationWithCV, ApplicationStatus } from '@/types/application'
import { APPLICATION_STATUSES } from '@/types/application'
import { deleteApplication, updateApplicationStatus } from '@/lib/applications/actions'
import { LocalDate } from '@/components/i18n/local-date'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Monogram } from '@/components/ui/monogram'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import { ChevronDown, ChevronUp, ExternalLink, FileText, Loader2, Pencil, Trash2 } from 'lucide-react'

const STAGE_DOT: Record<ApplicationStatus, string> = {
  applied: 'bg-slate-400',
  screening: 'bg-amber-400',
  interview: 'bg-brand-600',
  offering: 'bg-emerald-500',
  accepted: 'bg-emerald-700',
  rejected: 'bg-rose-400',
}

interface ApplicationCardProps {
  application: JobApplicationWithCV
  onDeleteSuccess?: (id: string) => void
}

/**
 * Expandable card matching EduMate's hybrid layout:
 * - Collapsed: Fast scanning of date, role, company, and stage with 'Show more'.
 * - Expanded: Blue border highlight with full notes, CV version, link, and action pills.
 */
export function ApplicationCard({ application, onDeleteSuccess }: ApplicationCardProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleDelete = () => {
    setErrorMsg(null)
    startTransition(async () => {
      const res = await deleteApplication(application.id)
      if (!res.success) {
        setShowDeleteConfirm(false)
        setErrorMsg(res.error || 'Could not delete the application.')
        return
      }
      setShowDeleteConfirm(false)
      onDeleteSuccess?.(application.id)
      router.refresh()
    })
  }

  const handleStatusChange = (newStatus: ApplicationStatus) => {
    if (newStatus === application.status) return
    setErrorMsg(null)
    startTransition(async () => {
      const res = await updateApplicationStatus(application.id, newStatus)
      if (!res.success) {
        setErrorMsg(res.error || 'Could not update the status.')
        return
      }
      router.refresh()
    })
  }

  const statusId = `status-${application.id}`

  return (
    <>
      <div
        className={`rounded-2xl bg-white p-5 transition-all duration-200 ${
          isExpanded
            ? 'border-2 border-brand-500 shadow-sm'
            : 'border border-slate-200/90 shadow-xs hover:border-slate-300'
        }`}
      >
        {/* Main row: Date, Position, Company, and Toggle */}
        <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[130px_minmax(0,1.2fr)_minmax(0,1fr)_auto]">
          {/* Column 1: Date */}
          <div>
            <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-400">Date</span>
            <span className="text-sm font-semibold tabular-nums text-slate-900">
              <LocalDate value={application.applied_date} />
            </span>
          </div>

          {/* Column 2: Role / Position */}
          <div className="min-w-0">
            <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-400">Position</span>
            <Link
              href={`/dashboard/applications/${application.id}`}
              className="block truncate text-base font-bold text-slate-900 transition-colors hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            >
              <span data-no-translate>{application.position}</span>
            </Link>
          </div>

          {/* Column 3: Company & Stage */}
          <div className="flex items-center gap-3 min-w-0">
            <Monogram name={application.company_name} size="sm" />
            <div className="min-w-0 flex-1">
              <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-400">Company</span>
              <p className="truncate text-xs font-semibold text-slate-800" data-no-translate>
                {application.company_name}
              </p>
            </div>
            <div className="shrink-0 hidden md:flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
              <span className={`h-2 w-2 rounded-full ${STAGE_DOT[application.status]}`} />
              <span className="capitalize">{application.status}</span>
            </div>
          </div>

          {/* Column 4: Expand / Collapse Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-brand-600 transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
              aria-expanded={isExpanded}
            >
              {isExpanded ? 'Show less' : 'Show more'}
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Expanded section: details & action buttons */}
        {isExpanded && (
          <div className="mt-5 border-t border-slate-100 pt-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-[130px_minmax(0,1fr)_minmax(0,1.2fr)]">
              {/* Linked CV */}
              <div>
                <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-400">CV Used</span>
                {application.cv ? (
                  <Link
                    href={`/dashboard/cv/${application.cv.id}`}
                    className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 hover:underline"
                    data-no-translate
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{application.cv.name}</span>
                  </Link>
                ) : (
                  <span className="mt-1 block text-xs text-slate-400">No CV linked</span>
                )}
              </div>

              {/* Notes or description */}
              <div className="min-w-0">
                <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-400">Notes</span>
                {application.notes ? (
                  <p className="mt-1 text-xs leading-5 text-slate-600" data-no-translate>
                    {application.notes}
                  </p>
                ) : (
                  <span className="mt-1 block text-xs text-slate-400">No notes added</span>
                )}
              </div>

              {/* Job posting link */}
              <div className="min-w-0">
                <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-400">Link</span>
                {application.job_url ? (
                  <a
                    href={application.job_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex max-w-full items-center gap-1 truncate text-xs font-medium text-brand-600 underline-offset-4 hover:underline"
                  >
                    <span className="truncate">{application.job_url}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                  </a>
                ) : (
                  <span className="mt-1 block text-xs text-slate-400">No link provided</span>
                )}
              </div>
            </div>

            {errorMsg ? (
              <p role="alert" className="mt-3 rounded-lg bg-red-50 p-2.5 text-xs font-medium text-red-700">
                {errorMsg}
              </p>
            ) : null}

            {/* Bottom action controls */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              {/* Quick stage selector */}
              <div className="flex items-center gap-2">
                <label htmlFor={statusId} className="text-xs font-medium text-slate-500">
                  Update stage:
                </label>
                <div className="relative">
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute left-2.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full ${STAGE_DOT[application.status]}`}
                  />
                  <select
                    id={statusId}
                    value={application.status}
                    onChange={(event) => handleStatusChange(event.target.value as ApplicationStatus)}
                    disabled={isPending}
                    className="h-8 appearance-none rounded-full border border-slate-200 bg-white pl-6 pr-7 text-xs font-medium text-slate-800 transition-colors hover:border-slate-300 focus-visible:border-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/20 disabled:opacity-50"
                  >
                    {APPLICATION_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  {isPending && !showDeleteConfirm ? (
                    <Loader2 className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-slate-400" />
                  ) : (
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Action buttons: Cancel/Delete, Reschedule/Edit, View Details */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="dangerOutline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isPending}
                  className="rounded-full"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Delete
                </Button>
                <ButtonLink
                  href={`/dashboard/applications/${application.id}`}
                  variant="brandOutline"
                  size="sm"
                  className="rounded-full"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  Edit
                </ButtonLink>
                <ButtonLink
                  href={`/dashboard/applications/${application.id}`}
                  variant="default"
                  size="sm"
                  className="rounded-full"
                >
                  View Details
                </ButtonLink>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete this application?"
        subject={`${application.position}, ${application.company_name}`}
        confirmLabel="Delete application"
        pending={isPending}
      >
        The application and its notes will be removed. The CV is not affected. This cannot be undone.
      </ConfirmDialog>
    </>
  )
}
