'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { CV } from '@/types/cv'
import { duplicateCV, deleteCV } from '@/lib/cv/actions'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Copy,
  Trash2,
  Edit3,
  Calendar,
  Loader2,
  AlertCircle,
} from 'lucide-react'

interface CVCardProps {
  cv: CV
}

export function CVCard({ cv }: CVCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleDuplicate = () => {
    setErrorMsg(null)
    startTransition(async () => {
      const res = await duplicateCV(cv.id)
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to duplicate CV')
        return
      }
      router.refresh()
    })
  }

  const handleDelete = () => {
    setErrorMsg(null)
    startTransition(async () => {
      const res = await deleteCV(cv.id)
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to delete CV')
        return
      }
      setShowDeleteConfirm(false)
      router.refresh()
    })
  }

  const templateVariant =
    cv.template === 'ats' ? 'default' : cv.template === 'modern' ? 'secondary' : 'outline'

  const formattedDate = new Date(cv.updated_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <>
      <Card className="flex flex-col justify-between border-stone-300 transition-colors hover:border-stone-500">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="line-clamp-1 text-base font-semibold text-slate-900">
                  {cv.name}
                </CardTitle>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Updated {formattedDate}</span>
                </div>
              </div>
            </div>
            <Badge variant={templateVariant} className="capitalize">
              {cv.template}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pb-4">
          {errorMsg && (
            <div
              role="alert"
              className="flex items-center gap-1.5 rounded bg-red-50 p-2 text-xs text-red-700"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
            <div className="font-medium text-slate-800">
              {cv.personal_info?.full_name || 'No name provided'}
            </div>
            {cv.personal_info?.professional_title && (
              <div className="text-slate-500">{cv.personal_info.professional_title}</div>
            )}
            {cv.personal_info?.email && (
              <div className="mt-1 text-slate-500">{cv.personal_info.email}</div>
            )}
          </div>

          {cv.skills && cv.skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {cv.skills.slice(0, 3).map((skill, i) => (
                <span
                  key={i}
                  className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                >
                  {skill}
                </span>
              ))}
              {cv.skills.length > 3 && (
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500">
                  +{cv.skills.length - 3}
                </span>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-slate-100 pt-3">
          <Link
            href={`/dashboard/cv/${cv.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit CV
          </Link>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-slate-600 hover:text-slate-900"
              onClick={handleDuplicate}
              disabled={isPending}
              aria-label={`Duplicate ${cv.name}`}
            >
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Copy className="h-3.5 w-3.5" />}
              <span className="ml-1 text-xs">Copy</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isPending}
              aria-label={`Delete ${cv.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
        >
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Delete CV?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete <strong>{cv.name}</strong>? This action cannot be undone.
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
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete CV'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
