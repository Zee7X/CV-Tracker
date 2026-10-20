'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { CV } from '@/types/cv'
import { duplicateCV, deleteCV } from '@/lib/cv/actions'
import { DOCUMENT_LANGUAGES, resolveDocumentLanguage } from '@/lib/cv/document'
import { TEMPLATE_NAMES } from '@/lib/format'
import { LocalDate } from '@/components/i18n/local-date'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Loader2 } from 'lucide-react'

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
  const language = DOCUMENT_LANGUAGES.find((l) => l.id === resolveDocumentLanguage(info?.document_language))?.label

  return (
    <>
      <article className="flex h-full flex-col rounded-lg border border-stone-300 bg-white transition-colors hover:border-stone-500">
        <Link
          href={`/dashboard/cv/${cv.id}`}
          className="block flex-1 rounded-t-lg px-5 pb-4 pt-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-800"
        >
          <h2 className="line-clamp-2 text-base font-semibold text-stone-950" data-no-translate>
            {cv.name}
          </h2>
          <p className="mt-1 text-xs text-stone-500">
            <span data-no-translate>{TEMPLATE_NAMES[cv.template] ?? cv.template}</span>
            <span aria-hidden="true"> · </span>
            <span data-no-translate>{language}</span>
            <span aria-hidden="true"> · </span>
            <span>Edited</span> <LocalDate value={cv.updated_at} />
          </p>

          <div className="mt-4 text-sm">
            <p className="font-medium text-stone-900">{info?.full_name || 'No name yet'}</p>
            {info?.professional_title ? <p className="text-stone-600">{info.professional_title}</p> : null}
          </div>

          {cv.skills && cv.skills.length > 0 ? (
            <p className="mt-3 line-clamp-2 text-xs text-stone-500">{cv.skills.join(', ')}</p>
          ) : null}
        </Link>

        {errorMsg ? (
          <p role="alert" className="mx-5 mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-800">
            {errorMsg}
          </p>
        ) : null}

        <div className="flex items-center gap-1 border-t border-stone-200 px-3 py-2">
          <Link
            href={`/dashboard/cv/${cv.id}`}
            className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-blue-800 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800"
          >
            Edit
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => run('duplicate', () => duplicateCV(cv.id), 'Could not duplicate the CV.')}
            disabled={isPending}
            aria-label={`Duplicate ${cv.name}`}
          >
            {pendingAction === 'duplicate' ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}
            Duplicate
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto text-red-700 hover:bg-red-50 hover:text-red-800"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isPending}
            aria-label={`Delete ${cv.name}`}
          >
            Delete
          </Button>
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
