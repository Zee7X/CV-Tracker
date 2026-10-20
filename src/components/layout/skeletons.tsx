import React from 'react'
import { ArrowLeft, Download, MoreHorizontal, PanelRightClose, Plus, Search } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { EditorSection } from '@/components/cv/editor/fields'
import { Bone, InputBone, SkeletonRegion, TextBone, TextareaBone } from '@/components/ui/skeleton'
import { buttonVariants } from '@/components/ui/button'
import { APPLICATION_STATUSES } from '@/types/application'
import { COVER_LETTER_TEMPLATES } from '@/lib/cover-letter/templates'
import { TEMPLATES_METADATA } from '@/components/cv/templates'
import { cn } from '@/lib/utils'

/*
 * Loading state for every dashboard route.
 *
 * Each skeleton is the real page with the data left out: the same PageHeader,
 * section titles, field labels and toolbar, with bones only where user data
 * goes. Heights match the loaded page (checked in the browser at 1280 and 390
 * px), so nothing jumps when the content arrives. When a component changes,
 * change its skeleton here too.
 */

/**
 * Same markup as Field in cv/editor/fields.tsx, but the label is plain text:
 * there is no input yet for it to point at.
 */
function Field({
  label,
  required,
  optional,
  hint,
  className = '',
  children,
}: {
  id?: string
  label: string
  required?: boolean
  optional?: boolean
  hint?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <span className="block text-sm font-medium text-stone-800">
        {label}
        {required ? <span className="text-red-700"> *</span> : null}
        {optional ? <span className="font-normal text-stone-500"> (optional)</span> : null}
      </span>
      {children}
      {hint ? <p className="text-xs text-stone-500">{hint}</p> : null}
    </div>
  )
}

/** A button that is visible but not usable until the page has loaded. */
function GhostButton({
  children,
  variant = 'default',
  size = 'default',
  className,
}: {
  children: React.ReactNode
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'icon'
  className?: string
}) {
  return (
    <span aria-hidden="true" className={cn(buttonVariants({ variant, size }), 'pointer-events-none', className)}>
      {children}
    </span>
  )
}

/* ------------------------------------------------------------------------ */
/* Overview: src/app/dashboard/page.tsx                                     */
/* ------------------------------------------------------------------------ */

function RowsPanel({ title, rows, trailing }: { title: string; rows: number; trailing: 'badge' | 'edit' }) {
  return (
    <section className="rounded-lg border border-stone-300 bg-white">
      <header className="flex items-center justify-between border-b border-stone-200 px-5 py-3">
        <h2 className="text-base font-semibold text-stone-950">{title}</h2>
        <TextBone className="w-20" />
      </header>
      <ul className="divide-y divide-stone-200">
        {Array.from({ length: rows }, (_, i) => (
          <li key={i} className="flex items-center justify-between gap-4 px-5 py-3">
            <span className="min-w-0 flex-1">
              <TextBone className={i % 2 ? 'w-40' : 'w-52'} />
              <TextBone size="xs" className="w-36" />
            </span>
            {trailing === 'badge' ? <Bone className="h-6 w-20" /> : <span className="text-xs font-medium text-stone-600">Edit</span>}
          </li>
        ))}
      </ul>
    </section>
  )
}

export function OverviewSkeleton() {
  const totals = ['Applications', 'Interviews', 'Offers', 'CVs']
  return (
    <SkeletonRegion className="space-y-6">
      <PageHeader
        title="Overview"
        description="Your latest applications and the CVs you used for them."
        actions={
          <>
            <GhostButton variant="outline">New CV</GhostButton>
            <GhostButton>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add application
            </GhostButton>
          </>
        }
      />
      <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-stone-300 bg-white sm:grid-cols-4">
        {totals.map((label, idx) => (
          <div
            key={label}
            className={`px-5 py-4 ${idx % 2 === 1 ? 'border-l border-stone-200' : ''} ${
              idx >= 2 ? 'border-t border-stone-200 sm:border-t-0' : ''
            } ${idx === 2 ? 'sm:border-l' : ''}`}
          >
            <p className="text-sm text-stone-600">{label}</p>
            <TextBone size="2xl" className="w-10" boxClassName="mt-1" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <RowsPanel title="Latest applications" rows={5} trailing="badge" />
        <RowsPanel title="Recently edited CVs" rows={3} trailing="edit" />
      </div>
    </SkeletonRegion>
  )
}

/* ------------------------------------------------------------------------ */
/* CV list and cover letter list: CVCard / CoverLetterCard grid              */
/* ------------------------------------------------------------------------ */

function DocumentCardBone({ kind }: { kind: 'cv' | 'letter' }) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-stone-300 bg-white">
      <div className="flex-1 px-5 pb-4 pt-5">
        <TextBone size="base" className="w-3/5" />
        <TextBone size="xs" className="w-1/2" boxClassName="mt-1" />
        <div className="mt-4">
          <TextBone className="w-2/5" />
          <TextBone className="w-3/5" />
        </div>
        {kind === 'cv' ? (
          <div className="mt-3">
            <TextBone size="xs" className="w-full" />
            <TextBone size="xs" className="w-4/5" />
          </div>
        ) : null}
      </div>
      <div className="flex items-center gap-1 border-t border-stone-200 px-3 py-2">
        <span className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-blue-800">Edit</span>
        <GhostButton variant="ghost" size="sm">
          Duplicate
        </GhostButton>
        <GhostButton variant="ghost" size="sm" className="ml-auto text-red-700">
          Delete
        </GhostButton>
      </div>
    </article>
  )
}

export function DocumentListSkeleton({ kind }: { kind: 'cv' | 'letter' }) {
  const header =
    kind === 'cv'
      ? {
          title: 'CVs',
          description: 'Keep one version per kind of role. Duplicate a CV to tailor it without losing the original.',
          action: 'New CV',
        }
      : {
          title: 'Cover letters',
          description: 'Letters and email bodies for specific applications. Fill in your details from a saved CV.',
          action: 'New cover letter',
        }
  return (
    <SkeletonRegion className="space-y-6">
      <PageHeader
        title={header.title}
        description={header.description}
        actions={
          <GhostButton>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {header.action}
          </GhostButton>
        }
      />
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <li key={i}>
            <DocumentCardBone kind={kind} />
          </li>
        ))}
      </ul>
    </SkeletonRegion>
  )
}

/* ------------------------------------------------------------------------ */
/* Applications: ApplicationList + ApplicationCard                           */
/* ------------------------------------------------------------------------ */

export function ApplicationsSkeleton() {
  const filters = ['All', ...APPLICATION_STATUSES.map((status) => status.label)]
  return (
    <SkeletonRegion className="space-y-6">
      <PageHeader
        title="Applications"
        description="Every job you applied to, the CV you sent, and where it stands."
        actions={
          <GhostButton>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add application
          </GhostButton>
        }
      />
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
          <span className="flex h-10 w-full items-center rounded-md border border-stone-300 bg-[#fffefa] pl-9 text-sm text-stone-400">
            Search company, position or notes
          </span>
        </div>
        <div className="scrollbar-none -mx-1 overflow-x-auto px-1">
          <div className="flex min-w-max gap-1 border-b border-stone-300">
            {filters.map((label, i) => (
              <span
                key={label}
                className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium ${
                  i === 0 ? 'border-blue-800 text-stone-950' : 'border-transparent text-stone-600'
                }`}
              >
                {label}
                <Bone className="h-3 w-2" />
              </span>
            ))}
          </div>
        </div>
        <ul className="divide-y divide-stone-200 overflow-hidden rounded-lg border border-stone-300 bg-white">
          {Array.from({ length: 5 }, (_, i) => (
            <li key={i} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-5">
              <div className="min-w-0 flex-1">
                {/* The title is a link inside a block, so its line box is 24px tall. */}
                <TextBone size="base" className={cn('h-3', i % 2 ? 'w-44' : 'w-56')} />
                <TextBone className="w-32" />
                <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                  <TextBone size="xs" className="w-36" />
                  <TextBone size="xs" className="w-40" />
                  <TextBone size="xs" className="w-20" />
                </span>
              </div>
              <div className="flex items-center gap-2">
                <InputBone className="h-9 w-28" />
                <span className="rounded-md px-2.5 py-2 text-xs font-semibold text-stone-700">Edit</span>
                <GhostButton variant="ghost" size="sm" className="text-red-700">
                  Delete
                </GhostButton>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </SkeletonRegion>
  )
}

/* ------------------------------------------------------------------------ */
/* ApplicationForm (new and edit)                                           */
/* ------------------------------------------------------------------------ */

export function ApplicationFormSkeleton({ editing }: { editing: boolean }) {
  return (
    <SkeletonRegion className="max-w-3xl space-y-5">
      <span className="inline-flex items-center gap-1 text-sm font-medium text-stone-600">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Applications
      </span>
      <div>
        {editing ? (
          <TextBone size="2xl" className="w-72 max-w-full" />
        ) : (
          <h1 className="text-2xl font-semibold text-stone-950">Add application</h1>
        )}
        <p className="mt-1 text-sm text-stone-600">
          {editing ? 'Update the stage, the CV you sent, or your notes.' : 'Record the job, the date you applied and the CV you sent.'}
        </p>
      </div>
      <div className="rounded-lg border border-stone-300 bg-white">
        <div className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-2">
          <Field label="Position" required>
            <InputBone empty={!editing} />
          </Field>
          <Field label="Company" required>
            <InputBone empty={!editing} />
          </Field>
          <Field label="Job posting link" optional className="sm:col-span-2">
            <InputBone empty={!editing} />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 border-t border-stone-200 px-5 py-5 sm:grid-cols-3">
          <Field label="Date applied" required>
            <InputBone />
          </Field>
          <Field label="Stage" required>
            <InputBone />
          </Field>
          <Field label="CV sent" optional>
            <InputBone />
          </Field>
        </div>
        <div className="border-t border-stone-200 px-5 py-5">
          <Field label="Notes" optional hint="Recruiter contact, interview dates, salary range, what to follow up on.">
            <TextareaBone rows={5} empty={!editing} />
          </Field>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-stone-200 px-5 py-4">
          <GhostButton variant="outline">Cancel</GhostButton>
          <GhostButton className="opacity-50">{editing ? 'Save changes' : 'Add application'}</GhostButton>
        </div>
      </div>
    </SkeletonRegion>
  )
}

/* ------------------------------------------------------------------------ */
/* CV editor: CVForm opens on the Personal section with the preview beside  */
/* ------------------------------------------------------------------------ */

const CV_SECTIONS = ['Settings', 'Personal', 'Summary', 'Skills', 'Experience', 'Projects', 'Education', 'Certifications']

function PreviewSheetBone() {
  return (
    <div className="mx-auto aspect-[210/297] w-full max-w-[794px] bg-white p-[7%] shadow-[0_1px_3px_rgba(0,0,0,0.12)] ring-1 ring-stone-300">
      <Bone className="h-[3.2%] w-2/5" />
      <Bone className="mt-[2%] h-[1.6%] w-1/3" />
      <Bone className="mt-[2%] h-[1.2%] w-3/4" />
      {[0, 1, 2].map((block) => (
        <div key={block} className="mt-[7%] space-y-[1.4%]">
          <Bone className="h-[1.6%] w-1/5" />
          <Bone className="h-[1.2%] w-full" />
          <Bone className="h-[1.2%] w-11/12" />
          <Bone className="h-[1.2%] w-4/5" />
        </div>
      ))}
    </div>
  )
}

export function CVEditorSkeleton({ editing }: { editing: boolean }) {
  return (
    <SkeletonRegion className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-stone-300 bg-white text-stone-700">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            {editing ? <TextBone size="xl" className="w-56" /> : <h1 className="text-xl font-semibold text-stone-950">New CV</h1>}
            <TextBone className="w-28" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="hidden h-9 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold text-stone-700 lg:inline-flex">
            <PanelRightClose className="h-4 w-4" aria-hidden="true" />
            Hide preview
          </span>
          <GhostButton variant="outline" size="sm">
            <Download className="h-4 w-4" aria-hidden="true" />
            Download PDF
          </GhostButton>
          <GhostButton size="sm" className="opacity-50">
            {editing ? 'Save changes' : 'Create CV'}
          </GhostButton>
          {editing ? (
            <GhostButton variant="ghost" size="icon" className="h-9 w-9">
              <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
            </GhostButton>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 rounded-md border border-stone-300 bg-stone-100 p-1 lg:hidden">
        <span className="rounded bg-white py-2 text-center text-sm font-semibold text-stone-950 shadow-sm">Edit</span>
        <span className="py-2 text-center text-sm font-semibold text-stone-600">Preview</span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-5">
          <div className="scrollbar-none -mx-1 overflow-x-auto px-1">
            <ul className="flex min-w-max gap-1 border-b border-stone-300">
              {CV_SECTIONS.map((label) => (
                <li
                  key={label}
                  className={`-mb-px border-b-2 px-3 py-2.5 text-sm font-medium ${
                    label === 'Personal' ? 'border-blue-800 text-stone-950' : 'border-transparent text-stone-600'
                  }`}
                >
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <EditorSection title="Personal information" description="How recruiters reach you. Only filled fields appear on the CV.">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full name" required>
                <InputBone empty={!editing} />
              </Field>
              <Field label="Professional title" optional hint="The role you are applying for, not only your current one.">
                <InputBone empty={!editing} />
              </Field>
              <Field label="Email" required>
                <InputBone empty={!editing} />
              </Field>
              <Field label="Phone" optional hint="Include the country code for international roles.">
                <InputBone empty={!editing} />
              </Field>
              <Field label="Location" optional className="sm:col-span-2">
                <InputBone empty={!editing} />
              </Field>
              <Field label="LinkedIn" optional>
                <InputBone empty={!editing} />
              </Field>
              <Field label="GitHub" optional>
                <InputBone empty={!editing} />
              </Field>
              <Field label="Portfolio or website" optional className="sm:col-span-2">
                <InputBone empty={!editing} />
              </Field>
            </div>
            <div className="border-t border-stone-200 pt-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <span className="h-20 w-20 shrink-0 rounded-md border border-stone-300 bg-stone-100" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div>
                    <p className="text-sm font-medium text-stone-800">
                      Photo <span className="font-normal text-stone-500">(optional)</span>
                    </p>
                    {/* Same hint the form shows for the default (non-Modern) templates. */}
                    <p className="text-xs text-stone-500">
                      Only the Modern template shows a photo. Many international employers prefer CVs without one.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <GhostButton variant="outline" size="sm">
                      Upload photo
                    </GhostButton>
                    <span className="text-xs font-medium text-blue-800">Use an image URL</span>
                  </div>
                </div>
              </div>
            </div>
          </EditorSection>

          <div className="flex items-center justify-between gap-2">
            <GhostButton variant="ghost" size="sm">
              Back
            </GhostButton>
            <GhostButton variant="outline" size="sm">
              Next: Summary
            </GhostButton>
          </div>
        </div>

        <div className="hidden min-w-0 lg:sticky lg:top-20 lg:block lg:self-start">
          <section className="flex flex-col overflow-hidden rounded-lg border border-stone-300 bg-stone-200/60 lg:h-[calc(100vh-7rem)]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-300 bg-[#fffefa] px-3 py-2">
              <div className="flex rounded-md border border-stone-300 bg-stone-100 p-0.5">
                {TEMPLATES_METADATA.map((tmpl) => (
                  <span key={tmpl.id} className="rounded px-2.5 py-1 text-xs font-semibold text-stone-600" data-no-translate>
                    {tmpl.name}
                  </span>
                ))}
              </div>
              <span className="h-8 w-28 rounded-md border border-stone-300 bg-white" />
            </div>
            <div className="flex-1 overflow-hidden p-4 sm:p-6">
              <PreviewSheetBone />
            </div>
          </section>
        </div>
      </div>
    </SkeletonRegion>
  )
}

/* ------------------------------------------------------------------------ */
/* Cover letter editor: CoverLetterForm                                     */
/* ------------------------------------------------------------------------ */

export function CoverLetterEditorSkeleton({ editing }: { editing: boolean }) {
  return (
    <SkeletonRegion className="space-y-5">
      <div className="flex flex-col gap-4 border-b border-stone-300 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1 text-sm font-medium text-stone-600">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Cover letters
          </span>
          {editing ? (
            <TextBone size="2xl" className="w-56" boxClassName="mt-1" />
          ) : (
            <h1 className="mt-1 text-2xl font-semibold text-stone-950">New cover letter</h1>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <GhostButton variant="outline">Copy text</GhostButton>
          <GhostButton variant="outline">
            <Download className="h-4 w-4" aria-hidden="true" />
            PDF
          </GhostButton>
          <GhostButton className="opacity-50">{editing ? 'Save' : 'Create letter'}</GhostButton>
        </div>
      </div>

      <div className="grid grid-cols-2 rounded-md border border-stone-300 bg-white p-1 lg:hidden">
        <span className="rounded bg-stone-900 py-2 text-center text-sm font-medium text-white">Edit</span>
        <span className="py-2 text-center text-sm font-medium text-stone-600">Preview</span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)]">
        <div className="space-y-5">
          <EditorSection title="Format">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {COVER_LETTER_TEMPLATES.map((tmpl) => (
                <div key={tmpl.id} className="rounded-md border border-stone-300 bg-white px-3.5 py-3">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold text-stone-950">{tmpl.name}</span>
                    <span className="text-xs text-stone-500">{tmpl.badge}</span>
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-stone-600">{tmpl.description}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Letter language" hint="Changes the greeting, date format and sign-off.">
                <InputBone />
              </Field>
              <Field label="Name in your list" required hint="Only you see this.">
                <InputBone empty={!editing} />
              </Field>
            </div>
            <div className="flex flex-col gap-2 border-t border-stone-200 pt-4 sm:flex-row sm:items-start">
              <Field label="Fill your details from a CV" className="flex-1" hint="Copies name, email, phone, city and your top skills.">
                <InputBone />
              </Field>
              <GhostButton variant="outline" className="sm:mt-7">
                Fill in
              </GhostButton>
            </div>
          </EditorSection>

          <EditorSection title="Job">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Position" required>
                <InputBone empty={!editing} />
              </Field>
              <Field label="Company" required>
                <InputBone empty={!editing} />
              </Field>
              <Field label="Addressed to" optional hint='If empty, the letter says "Hiring Team".'>
                <InputBone empty />
              </Field>
              <Field label="Company city or address" optional>
                <InputBone empty />
              </Field>
              <Field label="Where you found the job" optional hint="LinkedIn, JobStreet, a referral.">
                <InputBone empty />
              </Field>
              <Field label="Letter date" required>
                <InputBone />
              </Field>
            </div>
          </EditorSection>

          <EditorSection title="Your details">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full name" required>
                <InputBone />
              </Field>
              <Field label="Email" required>
                <InputBone />
              </Field>
              <Field label="Phone" optional>
                <InputBone />
              </Field>
              <Field label="City" optional hint="Printed before the date, e.g. Jakarta, 12 May 2026.">
                <InputBone />
              </Field>
            </div>
          </EditorSection>

          <EditorSection
            title="Letter text"
            description="Generated from the format and your job details until you edit it. Words in [brackets] are replaced when you fill the matching field."
            action={
              <GhostButton variant="outline" size="sm">
                Reset to template
              </GhostButton>
            }
          >
            <Field label="Opening" required>
              <TextareaBone rows={4} />
            </Field>
            <Field label="Body" required hint="Name one or two concrete things you did that match the job.">
              <TextareaBone rows={8} />
            </Field>
            <Field label="Closing" required>
              <TextareaBone rows={4} />
            </Field>
          </EditorSection>
        </div>

        <div className="hidden lg:block">
          <div className="space-y-2 lg:sticky lg:top-20">
            <p className="text-sm font-medium text-stone-700">Preview</p>
            <div className="space-y-4 rounded-sm border border-stone-300 bg-white p-6 sm:p-8">
              <div className="border-b border-stone-800 pb-2">
                <TextBone size="lg" className="w-1/2" />
                <TextBone size="xs" className="w-3/4" />
              </div>
              <div className="space-y-1">
                <TextBone size="xs" className="w-1/3" />
                <TextBone size="xs" className="w-1/4" />
                <TextBone size="xs" className="w-2/5" />
              </div>
              {[0, 1, 2, 3].map((block) => (
                <div key={block}>
                  <TextBone size="xs" className="w-full" />
                  <TextBone size="xs" className="w-full" />
                  <TextBone size="xs" className="w-4/5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SkeletonRegion>
  )
}

/* ------------------------------------------------------------------------ */
/* Account: AccountSettingsForm                                              */
/* ------------------------------------------------------------------------ */

export function AccountSkeleton() {
  return (
    <SkeletonRegion className="space-y-6">
      <PageHeader title="Account" description="Your profile photo, name and password." />
      <div className="max-w-3xl space-y-6">
        <EditorSection title="Profile" description="Your name is used as the default sender on new cover letters.">
          <div className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <span className="h-20 w-20 shrink-0 rounded-md border border-stone-300 bg-stone-100" />
              <div className="min-w-0 flex-1 space-y-2">
                <p className="text-sm font-medium text-stone-800">Photo</p>
                <p className="text-xs text-stone-500">
                  {'JPG, PNG or WebP. Resized to 320 px. Only the Modern CV template prints a photo; in the CV editor choose “Use account photo”.'}
                </p>
                <GhostButton variant="outline" size="sm">
                  Upload photo
                </GhostButton>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full name">
                <InputBone />
              </Field>
              <Field label="Email" hint="Used to sign in. It cannot be changed here.">
                <InputBone />
              </Field>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-stone-200 pt-4">
              <TextBone size="xs" className="w-40" />
              <GhostButton>Save profile</GhostButton>
            </div>
          </div>
        </EditorSection>

        <EditorSection title="Password">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="New password" hint="At least 8 characters.">
                <InputBone empty />
              </Field>
              <Field label="Repeat new password">
                <InputBone empty />
              </Field>
            </div>
            <div className="flex justify-end border-t border-stone-200 pt-4">
              <GhostButton variant="outline">Change password</GhostButton>
            </div>
          </div>
        </EditorSection>
      </div>
    </SkeletonRegion>
  )
}
