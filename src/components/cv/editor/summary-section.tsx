import React from 'react'
import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import type { CVInput } from '@/lib/validations/cv'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FileText } from 'lucide-react'

interface SummarySectionProps {
  register: UseFormRegister<CVInput>
  errors: FieldErrors<CVInput>
}

export function SummarySection({ register, errors }: SummarySectionProps) {
  return (
    <Card className="border-stone-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
          <FileText className="h-5 w-5 text-blue-600" />
          Professional Summary
        </CardTitle>
        <CardDescription>
          Highlight your key achievements, strengths, and years of relevant experience.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="summary" className="text-sm font-medium text-slate-700">
            About You / Summary
          </label>
          <textarea
            id="summary"
            rows={4}
            className="w-full rounded-md border border-slate-300 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="e.g. Organized operations professional with 5+ years of experience improving workflows, supporting customers, and coordinating cross-functional teams..."
            {...register('summary')}
          />
          {errors.summary && (
            <p className="text-xs text-red-600" role="alert">
              {errors.summary.message}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
