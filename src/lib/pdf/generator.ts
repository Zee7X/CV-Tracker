import { pdf, type DocumentProps } from '@react-pdf/renderer'
import { createPDFDocument } from './templates'
import type { CVWithRelations, CVTemplate } from '@/types/cv'

/**
 * Generates a PDF Blob from CV data using @react-pdf/renderer.
 */
export async function generatePDF(
  cv: CVWithRelations,
  templateOverride?: CVTemplate | string,
  language: 'id' | 'en' = 'id'
): Promise<Blob> {
  const doc = createPDFDocument(cv, templateOverride, language)
  const instance = pdf(doc as React.ReactElement<DocumentProps>)
  const blob = await instance.toBlob()
  return blob
}

/**
 * Generates a PDF Buffer (useful in Node / test / server contexts).
 */
export async function generatePDFBuffer(
  cv: CVWithRelations,
  templateOverride?: CVTemplate | string,
  language: 'id' | 'en' = 'id'
): Promise<Buffer> {
  const blob = await generatePDF(cv, templateOverride, language)
  const arrayBuffer = await blob.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

/**
 * Sanitizes a string for safe filesystem and download filenames.
 * Keeps alphanumeric characters, dashes, underscores, and dots.
 * Caps length at 100 characters.
 */
export function sanitizeFilename(filename?: string | null): string {
  if (!filename) return ''
  return filename
    .trim()
    .replace(/[^a-zA-Z0-9\-_.]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 100)
}

/**
 * Computes a clean, standardized filename for a CV PDF download.
 */
export function getPDFFileName(cv: CVWithRelations): string {
  const rawName = cv.personal_info?.full_name?.trim() || cv.name?.trim() || 'CV'
  const sanitized = sanitizeFilename(rawName)
  const cleanName = sanitized.replace(/^_+|_+$/g, '') || 'CV'
  return `${cleanName}-CV.pdf`
}

/**
 * Creates an object URL from a Blob for download.
 */
export function createDownloadLink(blob: Blob): string {
  return URL.createObjectURL(blob)
}

/**
 * Triggers browser file download and cleans up the object URL.
 */
export function triggerDownload(url: string, filename: string): void {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
