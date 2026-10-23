'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { CV } from '@/types/cv'
import { duplicateCV, deleteCV } from '@/lib/cv/actions'
import { resolveDocumentLanguage } from '@/lib/cv/document'
import { TEMPLATE_NAMES } from '@/lib/format'
import { LocalDate } from '@/components/i18n/local-date'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { CVThumbnail } from '@/components/cv/cv-thumbnail'
import { Copy, Loader2, Pencil, Trash2 } from 'lucide-react'

interface CVCardProps {
  cv: CV
}

export function CVCard({ cv }: CVCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [pendingAction, setPendingAction] = useState<'duplicate' | 'delete' | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const run = (
    kind: 'duplicate' | 'delete',
    action: () => Promise<{ success: boolean; error?: string }>,
    fallback: string
  ) => {
    setErrorMsg(null)
    setPendingAction(kind)
    startTransition(async () => {
      const res = await action()
      setPendingAction(null)
      if (!res.success) {
        setShowDeleteConfirm(false)
        setErrorMsg(res.error || fallback)
        return
      }
      setShowDeleteConfirm(false)
      router.refresh()
    })
  }

  const info = cv.personal_info

  return (
    <>
      <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-all hover:border-slate-300 hover:shadow-sm">
        <Link
          href={`/dashboard/cv/${cv.id}`}
          className="flex flex-1 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-600"
        >
          <div className="flex justify-center border-b border-slate-100 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 px-6 pt-6">
            <CVThumbnail cv={cv} className="w-[46%] translate-y-1 rounded-b-none transition-transform duration-200 group-hover:-translate-y-0.5" />
          </div>
          <div className="flex flex-1 flex-col px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="line-clamp-2 text-[15px] font-bold leading-snug text-slate-900" data-no-translate>
                {cv.name}
              </h2>
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600" data-no-translate>
                {resolveDocumentLanguage(info?.document_language)}
              </span>
            </div>
            <p className="mt-1 truncate text-xs text-slate-500">
              {info?.full_name ? (
                <span data-no-translate>{[info.full_name, info.professional_title].filter(Boolean).join(' · ')}</span>
              ) : (
                <span>No name yet</span>
              )}
            </p>
            <p className="mt-auto pt-3 text-xs text-slate-400">
              <span data-no-translate>{TEMPLATE_NAMES[cv.template] ?? cv.template}</span>
              <span aria-hidden="true"> · </span>
              <span>Edited</span> <LocalDate value={cv.updated_at} />
            </p>
          </div>
        </Link>

        {errorMsg ? (
          <p role="alert" className="mx-5 mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-800">
            {errorMsg}
          </p>
        ) : null}

        <div className="flex items-center gap-1 border-t border-slate-100 px-3 py-2">
          <Link
            href={`/dashboard/cv/${cv.id}`}
            className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-brand-600 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            Edit
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 rounded-full text-slate-600"
            onClick={() => run('duplicate', () => duplicateCV(cv.id), 'Could not duplicate the CV.')}
            disabled={isPending}
            aria-label={`Duplicate ${cv.name}`}
          >
            {pendingAction === 'duplicate' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            Duplicate
          </Button>
          <button
            type="button"
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 disabled:opacity-50"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isPending}
            aria-label={`Delete ${cv.name}`}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </article>

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => run('delete', () => deleteCV(cv.id), 'Could not delete the CV.')}
        title="Delete this CV?"
        subject={cv.name}
        confirmLabel="Delete CV"
        pending={pendingAction === 'delete'}
      >
        The CV and all its sections are removed. Applications that used it are kept. This cannot be undone.
      </ConfirmDialog>
    </>
  )
}
