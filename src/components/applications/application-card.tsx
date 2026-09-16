'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { JobApplicationWithCV, ApplicationStatus } from '@/types/application'
import { APPLICATION_STATUSES } from '@/types/application'
import { deleteApplication, updateApplicationStatus } from '@/lib/applications/actions'
import { StatusBadge } from './status-badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Building2,
  Briefcase,
  Calendar,
  ExternalLink,
  FileText,
  Trash2,
  Edit3,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

interface ApplicationCardProps {
  application: JobApplicationWithCV
  onDeleteSuccess?: (id: string) => void
}

export function ApplicationCard({ application, onDeleteSuccess }: ApplicationCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isNotesExpanded, setIsNotesExpanded] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleDelete = () => {
    setErrorMsg(null)
    startTransition(async () => {
      const res = await deleteApplication(application.id)
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to delete application')
        return
      }
      setShowDeleteConfirm(false)
      if (onDeleteSuccess) {
        onDeleteSuccess(application.id)
      }
      router.refresh()
    })
  }

  const handleStatusChange = (newStatus: ApplicationStatus) => {
    if (newStatus === application.status) return
    setErrorMsg(null)
    startTransition(async () => {
      const res = await updateApplicationStatus(application.id, newStatus)
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to update status')
        return
      }
      router.refresh()
    })
  }

  const formattedDate = new Date(application.applied_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <>
      <Card className="flex flex-col justify-between border-stone-300 transition-colors hover:border-stone-500">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="line-clamp-1 text-base font-semibold text-slate-900">
                    {application.company_name}
                  </CardTitle>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Briefcase className="h-3 w-3 shrink-0" />
                    <span className="line-clamp-1">{application.position}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <StatusBadge status={application.status} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pb-4">
          {errorMsg && (
            <div
              role="alert"
              className="flex items-center gap-1.5 rounded-lg bg-red-50 p-2.5 text-xs text-red-700"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Details Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-1 text-slate-500">
              <Calendar className="h-3.5 w-3.5" />
              <span>Applied {formattedDate}</span>
            </div>

            {application.cv && (
              <Link
                href={`/dashboard/cv/${application.cv.id}`}
                className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-slate-700 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                title={`Attached CV: ${application.cv.name}`}
              >
                <FileText className="h-3 w-3 text-slate-500" />
                <span className="line-clamp-1 font-medium">{application.cv.name}</span>
              </Link>
            )}

            {application.job_url && (
              <a
                href={application.job_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                aria-label={`Open job posting for ${application.position} at ${application.company_name}`}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Job Link</span>
              </a>
            )}
          </div>

          {/* Notes Preview / Accordion */}
          {application.notes && (
            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
              <div className="flex items-center justify-between font-medium text-slate-700">
                <span>Notes</span>
                {application.notes.length > 100 && (
                  <button
                    type="button"
                    onClick={() => setIsNotesExpanded(!isNotesExpanded)}
                    className="inline-flex items-center gap-0.5 text-[11px] text-blue-600 hover:text-blue-700"
                    aria-expanded={isNotesExpanded}
                  >
                    {isNotesExpanded ? (
                      <>
                        Less <ChevronUp className="h-3 w-3" />
                      </>
                    ) : (
                      <>
                        More <ChevronDown className="h-3 w-3" />
                      </>
                    )}
                  </button>
                )}
              </div>
              <p className={`mt-1 whitespace-pre-line text-slate-600 ${!isNotesExpanded && application.notes.length > 100 ? 'line-clamp-2' : ''}`}>
                {application.notes}
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-slate-100 pt-3">
          {/* Quick status dropdown */}
          <div className="flex items-center gap-1.5">
            <label htmlFor={`status-select-${application.id}`} className="sr-only">
              Change status for {application.company_name}
            </label>
            <select
              id={`status-select-${application.id}`}
              value={application.status}
              onChange={(e) => handleStatusChange(e.target.value as ApplicationStatus)}
              disabled={isPending}
              className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
            >
              {APPLICATION_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <Link href={`/dashboard/applications/${application.id}`}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-slate-600 hover:text-slate-900"
                aria-label={`Edit application for ${application.company_name}`}
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span className="ml-1 text-xs">Edit</span>
              </Button>
            </Link>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isPending}
              aria-label={`Delete application for ${application.company_name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Accessible Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`delete-title-${application.id}`}
          aria-describedby={`delete-desc-${application.id}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
        >
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 id={`delete-title-${application.id}`} className="text-lg font-bold text-slate-900">
              Delete Job Application?
            </h3>
            <p id={`delete-desc-${application.id}`} className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete your application for{' '}
              <strong>{application.position}</strong> at <strong>{application.company_name}</strong>?
              This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-red-600 hover:bg-red-700"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete Application'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
