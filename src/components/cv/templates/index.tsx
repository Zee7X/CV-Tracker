import React from 'react'
import type { CVTemplate, CVWithRelations, DocumentLanguage } from '@/types/cv'
import { AtsTemplate } from './ats'
import { ProfessionalTemplate } from './professional'
import { ModernTemplate } from './modern'
import { SAMPLE_CV, EMPTY_CV, isEmptyCV } from './sample-data'

export { AtsTemplate, ProfessionalTemplate, ModernTemplate, SAMPLE_CV, EMPTY_CV, isEmptyCV }

export interface TemplateMetadata {
  id: CVTemplate
  name: string
  description: string
}

export const TEMPLATES_METADATA: TemplateMetadata[] = [
  {
    id: 'ats',
    name: 'ATS Clean',
    description: 'One column, plain headings. Safest for job portals that parse your CV automatically.',
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Section labels in a left column with a navy accent. Suits formal and corporate roles.',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Two columns with a sidebar for contact and skills. Best when a person, not a parser, reads first.',
  },
]

export interface CVTemplateRendererProps {
  cv: CVWithRelations
  template?: CVTemplate
  language?: DocumentLanguage
  className?: string
}

export function CVTemplateRenderer({ cv, template, language, className = '' }: CVTemplateRendererProps) {
  switch (template || cv.template || 'ats') {
    case 'modern':
      return <ModernTemplate cv={cv} language={language} className={className} />
    case 'professional':
      return <ProfessionalTemplate cv={cv} language={language} className={className} />
    default:
      return <AtsTemplate cv={cv} language={language} className={className} />
  }
}

export default CVTemplateRenderer
