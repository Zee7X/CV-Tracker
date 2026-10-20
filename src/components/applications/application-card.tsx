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
import { ChevronDown, CalendarDays, ExternalLink, FileText, Loader2, Pencil, Trash2 } from 'lucide-react'

const STAGE_DOT: Record<ApplicationStatus, string> = {
  applied: 'bg-stone-400',
  screening: 'bg-amber-400',
  interview: 'bg-brand-600',
  offering: 'bg-emerald-500',
  accepted: 'bg-emerald-700',
  rejected: 'bg-stone-300',
}

interface ApplicationCardProps {
  application: JobApplicationWithCV
  onDeleteSuccess?: (id: string) => void
}

// Rendered as a row inside the applications list: what, where, when, which CV,
// and the stage, with the stage editable in place.
export function ApplicationCard({ application, onDeleteSuccess }: ApplicationCardProps) {
  const router = useRouter()
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
      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-3 px-4 py-4 transition-colors hover:bg-white/50/60 sm:px-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,200px)_120px_232px] lg:items-center lg:gap-4">
        <div className="col-span-2 flex min-w-0 items-start gap-3 lg:col-span-1 lg:items-center">
          <Monogram name={application.company_name} />
          <div className="min-w-0 flex-1">
            <Link
              href={`/dashboard/applications/${application.id}`}
              className="block truncate rounded text-sm font-semibold text-stone-900 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700"
            >
              <span data-no-translate>{application.position}</span>
            </Link>
            <p className="flex min-w-0 items-center gap-2 text-sm text-stone-600">
              <span className="truncate" data-no-translate>
                {application.company_name}
              </span>
              {application.job_url ? (
                <a
                  href={application.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-brand-700 underline-offset-4 hover:underline"
                >
                  Job posting
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : null}
            </p>
            {application.notes ? (
              <p className="mt-1 line-clamp-1 text-xs text-stone-500" data-no-translate>
                {application.notes}
              </p>
            ) : null}
            {errorMsg ? (
              <p role="alert" className="mt-2 text-xs font-medium text-red-700">
                {errorMsg}
              </p>
            ) : null}
          </div>
        </div>

        <div className="col-start-2 flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 lg:col-start-auto lg:contents">
          <span className="flex min-w-0 items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 shrink-0 text-stone-400" aria-hidden="true" />
            {application.cv ? (
              <Link
                href={`/dashboard/cv/${application.cv.id}`}
                className="truncate text-stone-700 underline-offset-4 hover:text-stone-900 hover:underline"
                data-no-translate
              >
                {application.cv.name}
              </Link>
            ) : (
              <span>No CV linked</span>
            )}
          </span>
          <span className="flex items-center gap-1.5 tabular-nums text-stone-600">
            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-stone-400 lg:hidden" aria-hidden="true" />
            <LocalDate value={application.applied_date} />
          </span>
        </div>

        <div className="col-start-2 flex items-center gap-1 lg:col-start-auto">
          <label htmlFor={statusId} className="sr-only">
            Stage
          </label>
          <span className="relative flex-1 lg:flex-none">
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute left-2.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full ${STAGE_DOT[application.status]}`}
            />
            <select
              id={statusId}
              value={application.status}
              onChange={(event) => handleStatusChange(event.target.value as ApplicationStatus)}
              disabled={isPending}
              className="h-9 w-full appearance-none rounded-xl border border-white/70 bg-white/60 pl-7 pr-8 text-sm font-medium text-stone-800 transition-colors hover:border-stone-900/10 focus-visible:border-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/20 disabled:opacity-50 lg:w-[136px]"
            >
              {APPLICATION_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            {isPending && !showDeleteConfirm ? (
              <Loader2 className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-stone-500" aria-label="Saving" />
            ) : (
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" aria-hidden="true" />
            )}
          </span>
          <Link
            href={`/dashboard/applications/${application.id}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-900/[0.05] hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700"
            aria-label={`Edit ${application.position} at ${application.company_name}`}
            title="Edit"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </Link>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-500 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 disabled:opacity-50"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isPending}
            aria-label={`Delete ${application.position} at ${application.company_name}`}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
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
