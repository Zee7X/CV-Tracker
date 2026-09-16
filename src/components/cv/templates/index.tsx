import React from 'react'
import type { CVTemplate, CVWithRelations } from '@/types/cv'
import { AtsTemplate } from './ats'
import { ProfessionalTemplate } from './professional'
import { ModernTemplate } from './modern'
import { SAMPLE_CV, EMPTY_CV, isEmptyCV, formatDateRange, formatMonthYear, formatDisplayUrl } from './sample-data'

export {
  AtsTemplate,
  ProfessionalTemplate,
  ModernTemplate,
  SAMPLE_CV,
  EMPTY_CV,
  isEmptyCV,
  formatDateRange,
  formatMonthYear,
  formatDisplayUrl,
}

export interface TemplateMetadata {
  id: CVTemplate
  name: string
  description: string
  recommendedFor: string
  features: string[]
}

export const TEMPLATES_METADATA: TemplateMetadata[] = [
  {
    id: 'ats',
    name: 'ATS Clean',
    description: 'Minimal single-column layout optimized for high readability and ATS parseability.',
    recommendedFor: 'Enterprise systems, automated job applications, and online portals.',
    features: ['Single-column', 'Linear hierarchy', 'High contrast', 'Parser-safe'],
  },
  {
    id: 'professional',
    name: 'Professional Executive',
    description: 'Distinguished corporate layout with navy/slate accents and structured skill badges.',
    recommendedFor: 'Finance, consulting, operations, management, and corporate roles.',
    features: ['Corporate navy theme', 'Skill pills', 'Accent bars', 'Structured entries'],
  },
  {
    id: 'modern',
    name: 'Modern Creative',
    description: 'Contemporary asymmetrical two-column layout with a strong sidebar and clear timeline.',
    recommendedFor: 'Client-facing, portfolio-based, creative, and modern professional roles.',
    features: ['Two-column sidebar', 'Experience timeline', 'Avatar support', 'Blue accents'],
  },
]

export interface CVTemplateRendererProps {
  cv: CVWithRelations
  template?: CVTemplate
  className?: string
}

/**
 * Universal CV Template Renderer
 * Dynamically renders the selected template with responsive fallback.
 */
export function CVTemplateRenderer({
  cv,
  template,
  className = '',
}: CVTemplateRendererProps) {
  const selectedTemplate: CVTemplate = template || cv.template || 'ats'

  switch (selectedTemplate) {
    case 'modern':
      return <ModernTemplate cv={cv} className={className} />
    case 'professional':
      return <ProfessionalTemplate cv={cv} className={className} />
    case 'ats':
    default:
      return <AtsTemplate cv={cv} className={className} />
  }
}

export default CVTemplateRenderer
