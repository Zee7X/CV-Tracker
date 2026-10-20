'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { JobApplicationWithCV, ApplicationStatus } from '@/types/application'
import { APPLICATION_STATUSES } from '@/types/application'
import { deleteApplication, updateApplicationStatus } from '@/lib/applications/actions'
import { LocalDate } from '@/components/i18n/local-date'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Loader2 } from 'lucide-react'

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
      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-5">
        <div className="min-w-0 flex-1">
          <Link
            href={`/dashboard/applications/${application.id}`}
            className="text-sm font-semibold text-stone-950 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800"
          >
            <span data-no-translate>{application.position}</span>
          </Link>
          <p className="text-sm text-stone-700" data-no-translate>
            {application.company_name}
          </p>
          <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-stone-500">
            <span>
              <span>Date applied</span>: <LocalDate value={application.applied_date} />
            </span>
            {application.cv ? (
              <Link href={`/dashboard/cv/${application.cv.id}`} className="underline-offset-4 hover:text-stone-800 hover:underline">
                <span>CV sent</span>: <span data-no-translate>{application.cv.name}</span>
              </Link>
            ) : (
              <span>No CV linked</span>
            )}
            {application.job_url ? (
              <a
                href={application.job_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-800 underline-offset-4 hover:underline"
              >
                Job posting<span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : null}
          </p>
          {application.notes ? <p className="mt-2 line-clamp-2 whitespace-pre-line text-xs text-stone-600">{application.notes}</p> : null}
          {errorMsg ? (
            <p role="alert" className="mt-2 text-xs font-medium text-red-700">
              {errorMsg}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor={statusId} className="sr-only">
            Stage
          </label>
          <select
            id={statusId}
            value={application.status}
            onChange={(event) => handleStatusChange(event.target.value as ApplicationStatus)}
            disabled={isPending}
            className="h-9 rounded-md border border-stone-300 bg-white px-2 text-sm text-stone-900 focus-visible:border-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800/25 disabled:opacity-50"
          >
            {APPLICATION_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          {isPending && !showDeleteConfirm ? <Loader2 className="h-4 w-4 animate-spin text-stone-500" aria-label="Saving" /> : null}
          <Link
            href={`/dashboard/applications/${application.id}`}
            className="rounded-md px-2.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 hover:text-stone-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800"
            aria-label={`Edit ${application.position} at ${application.company_name}`}
          >
            Edit
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-red-700 hover:bg-red-50 hover:text-red-800"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isPending}
            aria-label={`Delete ${application.position} at ${application.company_name}`}
          >
            Delete
          </Button>
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
