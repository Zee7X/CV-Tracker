'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { CoverLetter, CoverLetterTemplate } from '@/types/cover-letter'
import { duplicateCoverLetter, deleteCoverLetter } from '@/lib/cover-letter/actions'
import { LocalDate } from '@/components/i18n/local-date'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Monogram } from '@/components/ui/monogram'
import { Copy, Loader2, Pencil, Trash2 } from 'lucide-react'

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
      <article className="group flex h-full flex-col overflow-hidden rounded-3xl glass transition-[border-color,box-shadow] hover:border-stone-900/10 hover:shadow-[0_4px_16px_-6px_rgba(28,25,23,0.12)]">
        <Link
          href={href}
          className="flex flex-1 flex-col px-5 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-700"
        >
          <div className="flex items-start gap-3">
            <Monogram name={letter.company_name || letter.title} size="lg" />
            <div className="min-w-0 flex-1">
              <h2 className="line-clamp-2 text-[15px] font-semibold leading-snug text-stone-900" data-no-translate>
                {letter.title}
              </h2>
              <p className="mt-0.5 truncate text-sm text-stone-600" data-no-translate>
                {`${letter.job_title} · ${letter.company_name}`}
              </p>
            </div>
          </div>
          {letter.opening ? (
            <p className="mt-4 line-clamp-3 rounded-lg bg-white/50 px-3 py-2.5 font-serif text-[13px] leading-5 text-stone-600" data-no-translate>
              {letter.opening}
            </p>
          ) : null}
          <div className="mt-auto flex flex-wrap items-center gap-2 pt-4 text-xs text-stone-500">
            <span className="rounded-md bg-brand-50 px-1.5 py-0.5 font-medium text-brand-800">{FORMAT_LABELS[letter.template] ?? letter.template}</span>
            <span>
              <span>Edited</span> <LocalDate value={letter.updated_at} />
            </span>
          </div>
        </Link>

        {errorMsg ? (
          <p role="alert" className="mx-5 mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-800">
            {errorMsg}
          </p>
        ) : null}

        <div className="flex items-center gap-1 border-t border-stone-900/[0.06] px-3 py-2">
          <Link
            href={href}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-brand-700 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            Edit
          </Link>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8"
            onClick={() => run('duplicate', () => duplicateCoverLetter(letter.id), 'Could not duplicate the letter.')}
            disabled={isPending}
            aria-label={`Duplicate ${letter.title}`}
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
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isPending}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 disabled:opacity-50"
            aria-label={`Delete ${letter.title}`}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
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
