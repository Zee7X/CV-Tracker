import React from 'react'
import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import type { CVInput } from '@/lib/validations/cv'
import { EditorSection, Field, Textarea } from './fields'

interface SummarySectionProps {
  register: UseFormRegister<CVInput>
  errors: FieldErrors<CVInput>
}

export function SummarySection({ register, errors }: SummarySectionProps) {
  return (
    <EditorSection
      title="Summary"
      description="Two to four sentences at the top of the CV: your role, years of experience, what you work with, and the kind of job you want next."
    >
      <Field id="summary" label="Summary" optional error={errors.summary?.message}>
        <Textarea id="summary" rows={5} {...register('summary')} />
      </Field>
    </EditorSection>
  )
}
