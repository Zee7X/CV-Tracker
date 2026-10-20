'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { CoverLetter, CoverLetterTemplate } from '@/types/cover-letter'
import { duplicateCoverLetter, deleteCoverLetter } from '@/lib/cover-letter/actions'
import { LocalDate } from '@/components/i18n/local-date'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Loader2 } from 'lucide-react'

const FORMAT_LABELS: Record<CoverLetterTemplate, string> = {
  formal_id: 'Formal, Indonesian',
  professional_en: 'Professional, English',
  email_short: 'Short email',
  creative: 'Personal',
}

interface CoverLetterCardProps {
  letter: CoverLetter
}

export function CoverLetterCard({ letter }: CoverLetterCardProps) {
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
      setShowDeleteConfirm(false)
      if (!res.success) {
        setErrorMsg(res.error || fallback)
        return
      }
      router.refresh()
    })
  }

  const href = `/dashboard/cover-letters/${letter.id}/edit`

  return (
    <>
      <article className="flex h-full flex-col rounded-lg border border-stone-300 bg-white transition-colors hover:border-stone-500">
        <Link
          href={href}
          className="block flex-1 rounded-t-lg px-5 pb-4 pt-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-800"
        >
          <h2 className="line-clamp-2 text-base font-semibold text-stone-950" data-no-translate>
            {letter.title}
          </h2>
          <p className="mt-1 text-xs text-stone-500">
            <span>{FORMAT_LABELS[letter.template] ?? letter.template}</span>
            <span aria-hidden="true"> · </span>
            <span>Edited</span> <LocalDate value={letter.updated_at} />
          </p>
          <p className="mt-4 text-sm font-medium text-stone-900" data-no-translate>
            {letter.job_title}
          </p>
          <p className="text-sm text-stone-600" data-no-translate>
              {letter.company_name}
            </p>
        </Link>

        {errorMsg ? (
          <p role="alert" className="mx-5 mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-800">
            {errorMsg}
          </p>
        ) : null}

        <div className="flex items-center gap-1 border-t border-stone-200 px-3 py-2">
          <Link
            href={href}
            className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-blue-800 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800"
          >
            Edit
          </Link>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => run('duplicate', () => duplicateCoverLetter(letter.id), 'Could not duplicate the letter.')}
            disabled={isPending}
            aria-label={`Duplicate ${letter.title}`}
          >
            {pendingAction === 'duplicate' ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}
            Duplicate
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isPending}
            className="ml-auto text-red-700 hover:bg-red-50 hover:text-red-800"
            aria-label={`Delete ${letter.title}`}
          >
            Delete
          </Button>
        </div>
      </article>

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => run('delete', () => deleteCoverLetter(letter.id), 'Could not delete the letter.')}
        title="Delete this cover letter?"
        subject={letter.title}
        confirmLabel="Delete letter"
        pending={pendingAction === 'delete'}
      >
        This cover letter will be removed. This cannot be undone.
      </ConfirmDialog>
    </>
  )
}
