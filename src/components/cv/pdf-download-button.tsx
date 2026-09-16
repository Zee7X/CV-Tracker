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
}

export default function PDFDownloadButton({
  cv,
  template,
  variant = 'default',
  size = 'default',
  className = '',
}: PDFDownloadButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<{ message: string; detail?: string } | null>(null)

  const handleDownload = async () => {
    if (loading) return
    setLoading(true)
    setError(null)

    try {
      const validation = cvSchema.safeParse(cv)
      if (!validation.success) {
        setError({
          message: 'Fix the highlighted form fields before downloading your CV.',
          detail: validation.error.issues[0]?.message ?? 'Invalid CV data',
        })
        return
      }

      // Dynamic import to keep PDF renderer out of initial client bundle
      const { generatePDF, getPDFFileName, createDownloadLink, triggerDownload } =
        await import('@/lib/pdf/generator')

      const blob = await generatePDF(cv, template)
      const filename = getPDFFileName(cv)
      const url = createDownloadLink(blob)
      triggerDownload(url, filename)
    } catch (err) {
      console.error('PDF generation error:', err)
      setError({ message: 'Failed to generate PDF. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="inline-flex flex-col items-start">
      <Button
        type="button"
        onClick={handleDownload}
        disabled={loading}
        variant={variant}
        size={size}
        className={`gap-2 ${className}`}
        aria-busy={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        <span>{loading ? 'Generating PDF...' : 'Download PDF'}</span>
      </Button>
      {error && (
        <div className="mt-2 max-w-xs text-xs font-medium text-red-700" role="alert">
          <p>{error.message}</p>
          {error.detail ? <p className="mt-0.5 font-normal">{error.detail}</p> : null}
        </div>
      )}
    </div>
  )
}
