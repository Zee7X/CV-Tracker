'use client'

import React, { useEffect, useId, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  /** The item being acted on, shown as written by the user (never translated). */
  subject?: string
  children?: React.ReactNode
  confirmLabel: string
  pending?: boolean
}

/*
 * Native <dialog> opened with showModal(): the browser handles the focus trap,
 * Escape, the top layer and making the page behind it inert. Open and close
 * are animated in globals.css (.app-dialog).
 */
export function ConfirmDialog({ open, onClose, onConfirm, title, subject, children, confirmLabel, pending = false }: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      // Start on the safe choice so Enter does not delete by accident.
      cancelRef.current?.focus()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className="app-dialog glass w-[calc(100%-2rem)] max-w-md rounded-[28px] bg-white/80 p-0 text-stone-900"
      onCancel={(event) => {
        event.preventDefault()
        if (!pending) onClose()
      }}
      onClick={(event) => {
        // A click on the dialog element itself is a click on the backdrop.
        if (event.target === event.currentTarget && !pending) onClose()
      }}
    >
      <div className="p-6">
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        {subject ? (
          <p className="mt-2 break-words text-sm font-medium text-stone-800" data-no-translate>
            {subject}
          </p>
        ) : null}
        {children ? <div className={`${subject ? 'mt-1' : 'mt-2'} text-sm text-stone-600`}>{children}</div> : null}
        <div className="mt-6 flex justify-end gap-2">
          <Button ref={cancelRef} type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button
            type="button"
            className="border-red-700 bg-red-700 hover:border-red-800 hover:bg-red-800 active:bg-red-900"
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  )
}
