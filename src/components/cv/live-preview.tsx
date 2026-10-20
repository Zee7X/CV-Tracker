'use client'

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import type { CVTemplate, CVWithRelations } from '@/types/cv'
import { CVTemplateRenderer, TEMPLATES_METADATA, SAMPLE_CV, isEmptyCV } from './templates'

const A4_PIXEL_WIDTH = 794 // 210mm at 96dpi
const MIN_SCALE = 0.3
const MAX_SCALE = 1.5

// Pure so it's unit-testable without a DOM.
export function computeFitScale(containerWidth: number, a4PixelWidth = A4_PIXEL_WIDTH): number {
  return Math.min(1.1, Math.max(MIN_SCALE, Math.floor((containerWidth / a4PixelWidth) * 100) / 100))
}

export interface LivePreviewProps {
  cv: CVWithRelations
  template?: CVTemplate
  onTemplateChange?: (template: CVTemplate) => void
  showControls?: boolean
  showSampleToggle?: boolean
  className?: string
  containerClassName?: string
}

// useLayoutEffect warns during SSR; this keeps the measurement synchronous in the browser only.
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

export function LivePreview({
  cv,
  template: controlledTemplate,
  onTemplateChange,
  showControls = true,
  showSampleToggle = true,
  className = '',
  containerClassName = '',
}: LivePreviewProps) {
  const [internalTemplate, setInternalTemplate] = useState<CVTemplate>(cv?.template || 'ats')
  const [useSampleData, setUseSampleData] = useState(false)
  // null = follow the container width; a number = the user picked a zoom level.
  const [manualScale, setManualScale] = useState<number | null>(null)
  const [fitScale, setFitScale] = useState(0.7)
  const [sheetHeight, setSheetHeight] = useState(1123)
  const viewportRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)

  const activeTemplate = controlledTemplate ?? internalTemplate
  const isCVEmpty = useMemo(() => isEmptyCV(cv), [cv])
  const showingSample = useSampleData || isCVEmpty
  // An empty A4 page looks broken, so show an unsaved example until the user starts typing.
  const activeCV = showingSample ? { ...SAMPLE_CV, template: activeTemplate } : cv
  const scale = manualScale ?? fitScale

  useIsomorphicLayoutEffect(() => {
    const viewport = viewportRef.current
    const sheet = sheetRef.current
    if (!viewport || !sheet) return
    const measure = () => {
      const styles = window.getComputedStyle(viewport)
      const usable = viewport.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight)
      if (usable > 0) setFitScale(computeFitScale(usable))
      setSheetHeight(sheet.offsetHeight)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    observer.observe(sheet)
    return () => observer.disconnect()
  }, [])

  const selectTemplate = (next: CVTemplate) => {
    setInternalTemplate(next)
    onTemplateChange?.(next)
  }

  const zoom = (delta: number) =>
    setManualScale(Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.round((scale + delta) * 10) / 10)))

  return (
    <section
      className={`flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-[#ebe9e3] ${containerClassName}`}
      aria-label="CV preview"
      data-testid="cv-live-preview"
    >
      {showControls ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 bg-white px-3 py-2">
          <div role="radiogroup" aria-label="Template" className="flex rounded-lg border border-stone-200 bg-stone-100 p-0.5">
            {TEMPLATES_METADATA.map((tmpl) => {
              const selected = activeTemplate === tmpl.id
              return (
                <button
                  key={tmpl.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  title={tmpl.description}
                  onClick={() => selectTemplate(tmpl.id)}
                  className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800 ${
                    selected ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-600 hover:text-stone-950'
                  }`}
                  data-no-translate
                >
                  {tmpl.name}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            {showSampleToggle && !isCVEmpty ? (
              <label className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-stone-600">
                <input
                  type="checkbox"
                  checked={useSampleData}
                  onChange={(event) => setUseSampleData(event.target.checked)}
                  className="h-3.5 w-3.5 rounded border-stone-400 accent-blue-700"
                />
                Show sample
              </label>
            ) : null}
            <div className="flex items-center rounded-lg border border-stone-200 bg-white">
              <button
                type="button"
                onClick={() => zoom(-0.1)}
                disabled={scale <= MIN_SCALE}
                aria-label="Zoom Out"
                className="flex h-8 w-8 items-center justify-center text-stone-600 hover:text-stone-950 disabled:opacity-30"
              >
                <Minus className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setManualScale(null)}
                aria-label="Fit to Width"
                title="Fit to width"
                className={`h-8 min-w-12 border-x border-stone-300 px-1.5 text-xs tabular-nums ${
                  manualScale === null ? 'font-semibold text-stone-950' : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                {Math.round(scale * 100)}%
              </button>
              <button
                type="button"
                onClick={() => zoom(0.1)}
                disabled={scale >= MAX_SCALE}
                aria-label="Zoom In"
                className="flex h-8 w-8 items-center justify-center text-stone-600 hover:text-stone-950 disabled:opacity-30"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showingSample ? (
        <p role="status" className="border-b border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-900">
          {isCVEmpty
            ? 'Your CV is empty, so this preview uses sample data. The sample will not be saved.'
            : 'Showing sample data. Your own content is unchanged.'}
        </p>
      ) : null}

      <div ref={viewportRef} className="flex-1 overflow-auto p-4 sm:p-6" aria-label={`Preview of ${activeTemplate} CV`}>
        {/* The sheet keeps its real A4 width; only the visual scale changes, so line breaks match the PDF. */}
        <div className="mx-auto" style={{ width: A4_PIXEL_WIDTH * scale, height: sheetHeight * scale }}>
          <div
            ref={sheetRef}
            style={{ width: A4_PIXEL_WIDTH, transform: `scale(${scale})`, transformOrigin: 'top left' }}
            className="shadow-[0_1px_3px_rgba(0,0,0,0.12)] ring-1 ring-stone-300"
          >
            <CVTemplateRenderer cv={activeCV} template={activeTemplate} className={className} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default LivePreview
