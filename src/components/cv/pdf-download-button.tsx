'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cvSchema } from '@/lib/validations/cv'
import type { CVWithRelations, CVTemplate } from '@/types/cv'

interface PDFDownloadButtonProps {
  cv: CVWithRelations
  template?: CVTemplate
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  /** Called instead of showing the inline error, e.g. to jump to the invalid field. */
  onInvalid?: () => void
}

export default function PDFDownloadButton({
  cv,
  template,
  variant = 'default',
  size = 'default',
  className = '',
  onInvalid,
}: PDFDownloadButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    if (loading) return
    setError(null)

    const validation = cvSchema.safeParse(cv)
    if (!validation.success) {
      if (onInvalid) onInvalid()
      else setError(validation.error.issues[0]?.message ?? 'Invalid CV data')
      return
    }

    setLoading(true)
    try {
      // Loaded on demand so the PDF renderer stays out of the initial bundle.
      // The PDF language comes from the CV itself, never from the app UI language.
      const { generatePDF, getPDFFileName, createDownloadLink, triggerDownload } = await import('@/lib/pdf/generator')
      const blob = await generatePDF(cv, template)
      triggerDownload(createDownloadLink(blob), getPDFFileName(cv))
    } catch (err) {
      console.error('PDF generation error:', err)
      setError('Could not create the PDF. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative inline-flex">
      <Button
        type="button"
        onClick={handleDownload}
        disabled={loading}
        variant={variant}
        size={size}
        className={className}
        aria-busy={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Download className="h-4 w-4" aria-hidden="true" />
        )}
        <span>{loading ? 'Exporting...' : 'Download PDF'}</span>
      </Button>
      {error ? (
        <p
          role="alert"
          className="absolute right-0 top-full z-10 mt-1.5 w-64 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}
