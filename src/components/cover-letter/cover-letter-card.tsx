'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { CoverLetter } from '@/types/cover-letter'
import { duplicateCoverLetter, deleteCoverLetter } from '@/lib/cover-letter/actions'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Copy,
  Trash2,
  Edit3,
  Calendar,
  Building2,
  Briefcase,
  Loader2,
  AlertCircle,
} from 'lucide-react'

interface CoverLetterCardProps {
  letter: CoverLetter
}

export function CoverLetterCard({ letter }: CoverLetterCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleDuplicate = () => {
    setErrorMsg(null)
    startTransition(async () => {
      const res = await duplicateCoverLetter(letter.id)
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to duplicate cover letter')
        return
      }
      router.refresh()
    })
  }

  const handleDelete = () => {
    setErrorMsg(null)
    startTransition(async () => {
      const res = await deleteCoverLetter(letter.id)
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to delete cover letter')
        return
      }
      setShowDeleteConfirm(false)
      router.refresh()
    })
  }

  const templateLabel =
    letter.template === 'formal_id'
      ? 'Formal (ID)'
      : letter.template === 'professional_en'
      ? 'Corporate (EN)'
      : letter.template === 'email_short'
      ? 'Email Body'
      : 'Creative'

  const formattedDate = new Date(letter.updated_at).toLocaleDateString('id-ID', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <>
      <Card className="flex flex-col justify-between border-stone-300 bg-white transition-all hover:border-blue-300 hover:shadow-md">
        <div>
          <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3">
            <div className="space-y-1">
              <CardTitle className="text-base font-bold text-slate-900 line-clamp-1">
                <Link
                  href={`/dashboard/cover-letters/${letter.id}/edit`}
                  className="hover:text-blue-600 hover:underline"
                >
                  {letter.title}
                </Link>
              </CardTitle>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Updated {formattedDate}</span>
              </div>
            </div>
            <Badge variant="secondary" className="shrink-0 text-[10px] font-semibold uppercase">
              {templateLabel}
            </Badge>
          </CardHeader>

          <CardContent className="space-y-2 pb-4 text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <Briefcase className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{letter.job_title}</span>
            </div>

            <div className="flex items-center gap-2 text-slate-600">
              <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{letter.company_name}</span>
            </div>

            {errorMsg && (
              <div
                role="alert"
                className="mt-2 flex items-center gap-1.5 text-xs text-red-600"
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </CardContent>
        </div>

        <CardFooter className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 p-3">
          <Link href={`/dashboard/cover-letters/${letter.id}/edit`}>
            <Button size="sm" variant="default" className="gap-1 text-xs">
              <Edit3 className="h-3.5 w-3.5" />
              Edit Letter
            </Button>
          </Link>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleDuplicate}
              disabled={isPending}
              className="h-8 px-2 text-slate-600 hover:text-slate-900"
              title="Duplicate"
            >
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isPending}
              className="h-8 px-2 text-red-600 hover:bg-red-50 hover:text-red-700"
              title="Delete"
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
            <h3 className="text-lg font-bold text-slate-900">Delete Cover Letter?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete <strong>{letter.title}</strong>? This action cannot be undone.
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
                variant="default"
                className="bg-red-600 hover:bg-red-700"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Yes, Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

