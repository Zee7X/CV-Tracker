'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { applicationSchema, type ApplicationInput } from '@/lib/validations/application'
import type { JobApplication, JobApplicationWithCV } from '@/types/application'
import { APPLICATION_STATUSES } from '@/types/application'
import type { CV } from '@/types/cv'
import { createApplication, updateApplication } from '@/lib/applications/actions'
import { TEMPLATE_NAMES } from '@/lib/format'
import { Field, Textarea } from '@/components/cv/editor/fields'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import { CVThumbnail } from '@/components/cv/cv-thumbnail'
import { ArrowLeft, Check, ExternalLink, Loader2 } from 'lucide-react'

interface ApplicationFormProps {
  initialData?: JobApplication | JobApplicationWithCV
  userCVs?: Pick<CV, 'id' | 'name' | 'template' | 'personal_info'>[]
}

const selectClass =
  'flex h-10 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-950 shadow-[0_1px_1px_rgba(28,25,23,0.03)] transition-colors hover:border-stone-400 focus-visible:border-blue-700 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-700/15 disabled:opacity-50'

// The usual path of an application; Rejected can happen at any step and is shown apart.
const STAGES = APPLICATION_STATUSES.filter((status) => status.value !== 'rejected')

function localToday() {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

export function ApplicationForm({ initialData, userCVs = [] }: ApplicationFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  const isEditing = Boolean(initialData?.id)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      company_name: initialData?.company_name ?? '',
      position: initialData?.position ?? '',
      // applied_date is a plain date; slicing keeps it from shifting a day across time zones.
      applied_date: initialData?.applied_date ? String(initialData.applied_date).slice(0, 10) : localToday(),
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
        const res = isEditing && initialData?.id ? await updateApplication(initialData.id, data) : await createApplication(data)
        if (!res.success) {
          setServerError(res.error || 'Could not save the application. Check the fields and try again.')
          return
        }
        router.push('/dashboard/applications')
        router.refresh()
      } catch (err: unknown) {
        setServerError(err instanceof Error ? err.message : 'Could not save the application. Try again.')
      }
    })
  }

  const isLoading = isPending || isSubmitting
  const [watchedStatus, watchedCvId, watchedUrl] = useWatch({ control, name: ['status', 'cv_id', 'job_url'] })
  const linkedCV = userCVs.find((cv) => cv.id === watchedCvId)
  const stageIndex = STAGES.findIndex((stage) => stage.value === watchedStatus)

  return (
    <div className="space-y-5">
      <Link
        href="/dashboard/applications"
        className="inline-flex items-center gap-1 rounded text-sm font-medium text-stone-600 hover:text-stone-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Applications
      </Link>

      <div>
        <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-stone-950">
          {isEditing ? (
            <>
              <span data-no-translate>{initialData?.position}</span>
              <span className="text-stone-400"> · </span>
              <span data-no-translate>{initialData?.company_name}</span>
            </>
          ) : (
            'Add application'
          )}
        </h1>
        <p className="mt-1.5 text-sm text-stone-600">
          {isEditing ? 'Update the stage, the CV you sent, or your notes.' : 'Record the job, the date you applied and the CV you sent.'}
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="rounded-xl border border-stone-200 bg-white shadow-[0_1px_2px_rgba(28,25,23,0.04)]">
        {serverError ? (
          <p role="alert" className="mx-5 mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {serverError}
          </p>
        ) : null}

        <fieldset className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-2">
          <legend className="sr-only">Job</legend>
          <Field id="position" label="Position" required error={errors.position?.message}>
            <Input
              id="position"
              placeholder="Technical Support Engineer"
              aria-invalid={Boolean(errors.position)}
              {...register('position')}
            />
          </Field>
          <Field id="company_name" label="Company" required error={errors.company_name?.message}>
            <Input
              id="company_name"
              placeholder="Company name"
              autoComplete="organization"
              aria-invalid={Boolean(errors.company_name)}
              {...register('company_name')}
            />
          </Field>
          <Field id="job_url" label="Job posting link" optional error={errors.job_url?.message} className="sm:col-span-2">
            <Input
              id="job_url"
              type="url"
              inputMode="url"
              placeholder="https://"
              aria-invalid={Boolean(errors.job_url)}
              {...register('job_url')}
            />
          </Field>
        </fieldset>

        <fieldset className="grid grid-cols-1 gap-4 border-t border-stone-100 px-5 py-5 sm:grid-cols-3">
          <legend className="sr-only">Progress</legend>
          <Field id="applied_date" label="Date applied" required error={errors.applied_date?.message}>
            <Input id="applied_date" type="date" aria-invalid={Boolean(errors.applied_date)} {...register('applied_date')} />
          </Field>
          <Field id="status" label="Stage" required error={errors.status?.message}>
            <select id="status" className={selectClass} aria-invalid={Boolean(errors.status)} {...register('status')}>
              {APPLICATION_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </Field>
          <Field
            id="cv_id"
            label="CV sent"
            optional
            error={errors.cv_id?.message}
            hint={userCVs.length === 0 ? 'You have no saved CVs yet.' : undefined}
          >
            <select id="cv_id" className={selectClass} aria-invalid={Boolean(errors.cv_id)} {...register('cv_id')}>
              <option value="">Not linked</option>
              {userCVs.map((cv) => (
                <option key={cv.id} value={cv.id} data-no-translate>
                  {`${cv.name} · ${TEMPLATE_NAMES[cv.template] ?? cv.template}`}
                </option>
              ))}
            </select>
          </Field>
        </fieldset>

        <div className="border-t border-stone-100 px-5 py-5">
          <Field
            id="notes"
            label="Notes"
            optional
            hint="Recruiter contact, interview dates, salary range, what to follow up on."
            error={errors.notes?.message}
          >
            <Textarea id="notes" rows={5} aria-invalid={Boolean(errors.notes)} {...register('notes')} />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-stone-100 px-5 py-4">
          <ButtonLink href="/dashboard/applications" variant="outline" aria-disabled={isLoading}>
            Cancel
          </ButtonLink>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {isLoading ? 'Saving' : isEditing ? 'Save changes' : 'Add application'}
          </Button>
        </div>
      </form>

      <aside className="space-y-4 xl:sticky xl:top-8">
        <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-[0_1px_2px_rgba(28,25,23,0.04)]">
          <h2 className="text-sm font-semibold text-stone-950">Progress</h2>
          {watchedStatus === 'rejected' ? (
            <p className="mt-3 rounded-lg bg-stone-100 px-3 py-2.5 text-sm text-stone-600">
              Marked as rejected. Keep it here so you remember which CV you sent.
            </p>
          ) : (
            <ol className="mt-4 space-y-0">
              {STAGES.map((stage, index) => {
                const reached = stageIndex >= index
                const current = stageIndex === index
                return (
                  <li key={stage.value} className="relative flex gap-3 pb-4 last:pb-0">
                    {index < STAGES.length - 1 ? (
                      <span
                        aria-hidden="true"
                        className={`absolute left-[9px] top-5 h-[calc(100%-12px)] w-0.5 ${stageIndex > index ? 'bg-blue-600' : 'bg-stone-200'}`}
                      />
                    ) : null}
                    <span
                      aria-hidden="true"
                      className={`relative z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        current ? 'border-blue-600 bg-white' : reached ? 'border-blue-600 bg-blue-600' : 'border-stone-200 bg-white'
                      }`}
                    >
                      {current ? <span className="h-2 w-2 rounded-full bg-blue-600" /> : reached ? <Check className="h-3 w-3 text-white" /> : null}
                    </span>
                    <span className={`text-sm ${current ? 'font-semibold text-stone-950' : reached ? 'text-stone-700' : 'text-stone-400'}`}>
                      {stage.label}
                      {current ? <span className="sr-only"> (current stage)</span> : null}
                    </span>
                  </li>
                )
              })}
            </ol>
          )}
        </section>

        <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-[0_1px_2px_rgba(28,25,23,0.04)]">
          <h2 className="text-sm font-semibold text-stone-950">CV sent</h2>
          {linkedCV ? (
            <Link
              href={`/dashboard/cv/${linkedCV.id}`}
              className="mt-3 flex items-center gap-3 rounded-lg border border-stone-200 p-3 transition-colors hover:border-stone-300 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
            >
              <CVThumbnail cv={linkedCV} className="w-12" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-stone-950" data-no-translate>
                  {linkedCV.name}
                </span>
                <span className="block text-xs text-stone-500" data-no-translate>
                  {TEMPLATE_NAMES[linkedCV.template] ?? linkedCV.template}
                </span>
              </span>
            </Link>
          ) : (
            <p className="mt-2 text-sm leading-6 text-stone-500">
              Choose a CV in the form so you can open the exact version before an interview.
            </p>
          )}
        </section>

        {watchedUrl ? (
          <a
            href={watchedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-5 py-4 text-sm font-medium text-blue-700 shadow-[0_1px_2px_rgba(28,25,23,0.04)] transition-colors hover:border-stone-300 hover:bg-stone-50"
          >
            Open the job posting
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : null}
      </aside>
      </div>
    </div>
  )
}
