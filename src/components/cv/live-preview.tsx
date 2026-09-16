'use client'

import React, { useState, useMemo, useRef } from 'react'
import type { CVTemplate, CVWithRelations } from '@/types/cv'
import {
  CVTemplateRenderer,
  TEMPLATES_METADATA,
  SAMPLE_CV,
  isEmptyCV,
} from './templates'
import {
  ZoomIn,
  ZoomOut,
  Sparkles,
  Maximize2,
  Printer,
  LayoutTemplate,
  Eye,
  FileCheck,
} from 'lucide-react'

export interface LivePreviewProps {
  cv: CVWithRelations
  template?: CVTemplate
  onTemplateChange?: (template: CVTemplate) => void
  showControls?: boolean
  showSampleToggle?: boolean
  initialScale?: number
  className?: string
  containerClassName?: string
}

export function LivePreview({
  cv,
  template: controlledTemplate,
  onTemplateChange,
  showControls = true,
  showSampleToggle = true,
  initialScale = 1,
  className = '',
  containerClassName = '',
}: LivePreviewProps) {
  const [internalTemplate, setInternalTemplate] = useState<CVTemplate>(
    cv?.template || 'professional'
  )
  const [scale, setScale] = useState<number>(initialScale)
  const [useSampleData, setUseSampleData] = useState<boolean>(false)
  const [fitMode, setFitMode] = useState<boolean>(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const activeTemplate = controlledTemplate ?? internalTemplate

  const handleTemplateSelect = (newTemplate: CVTemplate) => {
    setInternalTemplate(newTemplate)
    if (onTemplateChange) {
      onTemplateChange(newTemplate)
    }
  }

  const isCVEmpty = useMemo(() => isEmptyCV(cv), [cv])
  const showingSampleData = useSampleData || isCVEmpty

  // An empty A4 page looks broken, so use a non-persistent example until the user starts typing.
  const activeCV = useMemo(() => {
    if (showingSampleData) {
      return {
        ...SAMPLE_CV,
        template: activeTemplate,
      }
    }
    return cv || SAMPLE_CV
  }, [showingSampleData, cv, activeTemplate])

  // Zoom handlers
  const handleZoomIn = () => {
    setFitMode(false)
    setScale((prev) => Math.min(1.5, Number((prev + 0.1).toFixed(2))))
  }

  const handleZoomOut = () => {
    setFitMode(false)
    setScale((prev) => Math.max(0.4, Number((prev - 0.1).toFixed(2))))
  }

  const handleResetZoom = () => {
    setFitMode(false)
    setScale(1)
  }

  const handleFitToWidth = () => {
    if (!containerRef.current) return
    const containerWidth = containerRef.current.clientWidth - 48 // Account for padding
    const a4PixelWidth = 794 // Approx A4 width in px (210mm @ 96dpi)
    if (containerWidth > 0) {
      const calculatedScale = Math.min(1.1, Math.max(0.4, Number((containerWidth / a4PixelWidth).toFixed(2))))
      setScale(calculatedScale)
      setFitMode(true)
    }
  }

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <section
      className={`flex flex-col overflow-hidden rounded-lg border border-stone-300 bg-stone-100 text-slate-900 shadow-sm ${containerClassName}`}
      aria-label="CV Live Preview Container"
      data-testid="cv-live-preview"
    >
      {/* Control Bar */}
      {showControls && (
        <header className="z-10 flex flex-wrap items-center justify-between gap-3 border-b border-stone-300 bg-white px-4 py-3">
          {/* Template Switcher Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5" role="tablist" aria-label="CV Template Selector">
            <span className="mr-1.5 flex items-center gap-1 text-xs font-semibold text-slate-600">
              <LayoutTemplate className="h-3.5 w-3.5 text-blue-600" />
              Template:
            </span>
            {TEMPLATES_METADATA.map((tmpl) => {
              const isSelected = activeTemplate === tmpl.id
              return (
                <button
                  key={tmpl.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls={`preview-panel-${tmpl.id}`}
                  onClick={() => handleTemplateSelect(tmpl.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'border border-stone-300 bg-stone-50 text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  <span>{tmpl.name}</span>
                  {isSelected && <FileCheck className="h-3 w-3 text-blue-100" />}
                </button>
              )
            })}
          </div>

          {/* Action & Zoom Controls */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Sample CV Toggle */}
            {showSampleToggle && (
              <button
                type="button"
                onClick={() => setUseSampleData((prev) => !prev)}
                disabled={isCVEmpty}
                className={`px-2.5 py-1.5 text-xs rounded-lg border transition-all flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                  showingSampleData
                    ? 'border-blue-200 bg-blue-50 text-blue-700 font-medium disabled:cursor-default'
                    : 'border-stone-300 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                }`}
                title="Toggle between your CV data and filled sample data"
                aria-pressed={showingSampleData}
              >
                <Sparkles className={`h-3.5 w-3.5 ${showingSampleData ? 'text-blue-600' : 'text-slate-500'}`} />
                <span>{isCVEmpty ? 'Sample preview' : useSampleData ? 'Sample Data ON' : 'Show Sample'}</span>
              </button>
            )}

            {/* Scale / Zoom Actions */}
            <div className="flex items-center rounded-lg border border-stone-300 bg-stone-50 p-0.5 text-xs">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={scale <= 0.4}
                className="cursor-pointer rounded-md p-1.5 text-slate-600 hover:bg-stone-200 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent"
                title="Zoom Out"
                aria-label="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleResetZoom}
                className="cursor-pointer rounded-md px-2 py-1 font-mono text-[11px] text-slate-600 hover:bg-stone-200 hover:text-slate-900"
                title="Reset Zoom to 100%"
                aria-label="Reset Zoom"
              >
                {Math.round(scale * 100)}%
              </button>

              <button
                type="button"
                onClick={handleZoomIn}
                disabled={scale >= 1.5}
                className="cursor-pointer rounded-md p-1.5 text-slate-600 hover:bg-stone-200 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent"
                title="Zoom In"
                aria-label="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleFitToWidth}
                className={`cursor-pointer rounded-md p-1.5 transition-colors hover:bg-stone-200 ${
                  fitMode ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Fit to Container Width"
                aria-label="Fit to Width"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Print / Preview Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="cursor-pointer rounded-lg border border-stone-300 bg-white p-1.5 text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Print CV or Save as PDF"
              aria-label="Print or Save CV"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>
      )}

      {/* Empty State Banner */}
      {isCVEmpty && (
        <div
          role="status"
          className="flex items-center gap-2 border-b border-blue-200 bg-blue-50 px-4 py-2 text-xs text-blue-900"
        >
          <Eye className="h-4 w-4 shrink-0 text-blue-600" />
          <span>Your CV is empty, so this preview uses sample data. The sample will not be saved.</span>
        </div>
      )}

      {/* Preview Viewport & A4 Stage */}
      <main
        ref={containerRef}
        id={`preview-panel-${activeTemplate}`}
        role="tabpanel"
        className="relative flex min-h-[500px] flex-1 items-start justify-center overflow-auto bg-stone-200/70 p-4 md:p-8"
        tabIndex={0}
        aria-label={`Live preview of ${activeTemplate} CV`}
      >
        {/* Scaled A4 Paper Wrapper */}
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          className="w-full max-w-[210mm] rounded-sm bg-white text-slate-900 shadow-lg ring-1 ring-stone-300 print:transform-none print:shadow-none print:ring-0"
        >
          <CVTemplateRenderer
            cv={activeCV}
            template={activeTemplate}
            className={className}
          />
        </div>
      </main>
    </section>
  )
}

export default LivePreview
