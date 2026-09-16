'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { applicationSchema, type ApplicationInput } from '@/lib/validations/application'
import type { JobApplication, JobApplicationWithCV } from '@/types/application'
import { APPLICATION_STATUSES } from '@/types/application'
import type { CV } from '@/types/cv'
import { createApplication, updateApplication } from '@/lib/applications/actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  FileEdit,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Save,
} from 'lucide-react'

interface ApplicationFormProps {
  initialData?: JobApplication | JobApplicationWithCV
  userCVs?: Pick<CV, 'id' | 'name' | 'template'>[]
}

export function ApplicationForm({ initialData, userCVs = [] }: ApplicationFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  const isEditing = Boolean(initialData?.id)

  const todayStr = new Date().toISOString().slice(0, 10)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      company_name: initialData?.company_name ?? '',
      position: initialData?.position ?? '',
      applied_date: initialData?.applied_date
        ? new Date(initialData.applied_date).toISOString().slice(0, 10)
        : todayStr,
      status: initialData?.status ?? 'applied',
      cv_id: initialData?.cv_id ?? '',
      job_url: initialData?.job_url ?? '',
      notes: initialData?.notes ?? '',
    },
  })

  const onSubmit = (data: ApplicationInput) => {
    setServerError(null)
    startTransition(async () => {
      try {
        if (isEditing && initialData?.id) {
          const res = await updateApplication(initialData.id, data)
          if (!res.success) {
            setServerError(res.error || 'Failed to update application')
            return
          }
        } else {
          const res = await createApplication(data)
          if (!res.success) {
            setServerError(res.error || 'Failed to create application')
            return
          }
        }

        router.push('/dashboard/applications')
        router.refresh()
      } catch (err: unknown) {
        setServerError(err instanceof Error ? err.message : 'An unexpected error occurred')
      }
    })
  }

  const isLoading = isPending || isSubmitting

  return (
    <div className="space-y-6">
      {/* Header with back link */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/applications"
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Applications
        </Link>
      </div>

      <Card className="border-stone-300">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <FileEdit className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">
                {isEditing ? 'Edit Job Application' : 'Add New Job Application'}
              </CardTitle>
              <CardDescription className="text-sm text-slate-500">
                {isEditing
                  ? 'Update company, position, status, or attached CV details.'
                  : 'Track a new job opportunity and keep notes in one place.'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {serverError && (
            <div
              role="alert"
              className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200"
            >
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Row 1: Company Name & Position */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="company_name"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Company Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    id="company_name"
                    type="text"
                    placeholder="e.g. Google, Stripe, Acme Corp"
                    aria-invalid={Boolean(errors.company_name)}
                    aria-describedby={errors.company_name ? 'company_name_error' : undefined}
                    {...register('company_name')}
                  />
                </div>
                {errors.company_name && (
                  <p id="company_name_error" role="alert" className="mt-1 text-xs text-red-600">
                    {errors.company_name.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="position"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Job Position <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    id="position"
                    type="text"
                    placeholder="e.g. Operations Coordinator"
                    aria-invalid={Boolean(errors.position)}
                    aria-describedby={errors.position ? 'position_error' : undefined}
                    {...register('position')}
                  />
                </div>
                {errors.position && (
                  <p id="position_error" role="alert" className="mt-1 text-xs text-red-600">
                    {errors.position.message}
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: Applied Date & Status */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="applied_date"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Date Applied <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    id="applied_date"
                    type="date"
                    aria-invalid={Boolean(errors.applied_date)}
                    aria-describedby={errors.applied_date ? 'applied_date_error' : undefined}
                    {...register('applied_date')}
                  />
                </div>
                {errors.applied_date && (
                  <p id="applied_date_error" role="alert" className="mt-1 text-xs text-red-600">
                    {errors.applied_date.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
                  aria-invalid={Boolean(errors.status)}
                  aria-describedby={errors.status ? 'status_error' : undefined}
                  {...register('status')}
                >
                  {APPLICATION_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                {errors.status && (
                  <p id="status_error" role="alert" className="mt-1 text-xs text-red-600">
                    {errors.status.message}
                  </p>
                )}
              </div>
            </div>

            {/* Row 3: Attached CV & Job URL */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="cv_id" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Attached CV <span className="text-xs font-normal text-slate-500">(Optional)</span>
                </label>
                <select
                  id="cv_id"
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
                  aria-invalid={Boolean(errors.cv_id)}
                  aria-describedby={errors.cv_id ? 'cv_id_error' : undefined}
                  {...register('cv_id')}
                >
                  <option value="">None / Not Linked</option>
                  {userCVs.map((cv) => (
                    <option key={cv.id} value={cv.id}>
                      {cv.name} ({cv.template})
                    </option>
                  ))}
                </select>
                {errors.cv_id && (
                  <p id="cv_id_error" role="alert" className="mt-1 text-xs text-red-600">
                    {errors.cv_id.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="job_url"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Job Posting URL <span className="text-xs font-normal text-slate-500">(Optional)</span>
                </label>
                <Input
                  id="job_url"
                  type="url"
                  placeholder="https://jobs.example.com/posting/123"
                  aria-invalid={Boolean(errors.job_url)}
                  aria-describedby={errors.job_url ? 'job_url_error' : undefined}
                  {...register('job_url')}
                />
                {errors.job_url && (
                  <p id="job_url_error" role="alert" className="mt-1 text-xs text-red-600">
                    {errors.job_url.message}
                  </p>
                )}
              </div>
            </div>

            {/* Row 4: Notes */}
            <div>
              <label htmlFor="notes" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Notes & Details <span className="text-xs font-normal text-slate-500">(Optional)</span>
              </label>
              <textarea
                id="notes"
                rows={4}
                placeholder="Add salary expectations, interview feedback, contact details, recruiter notes..."
                className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
                aria-invalid={Boolean(errors.notes)}
                aria-describedby={errors.notes ? 'notes_error' : undefined}
                {...register('notes')}
              />
              {errors.notes && (
                <p id="notes_error" role="alert" className="mt-1 text-xs text-red-600">
                  {errors.notes.message}
                </p>
              )}
            </div>

            {/* Actions: Submit & Cancel */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
              <Link href="/dashboard/applications">
                <Button type="button" variant="outline" disabled={isLoading}>
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>{isEditing ? 'Save Changes' : 'Create Application'}</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
