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
/* Overview: src/app/dashboard/page.tsx + components/dashboard/overview.tsx */
/* ------------------------------------------------------------------------ */

const PANEL = 'rounded-3xl glass'
const STAT_LABELS = ['Applications', 'Still open', 'Interviews', 'Response rate']

/** Same header as Panel in layout/page-header.tsx. */
function PanelHead({ title, description, action }: { title: string; description?: string; action?: string }) {
  return (
    <header className="flex items-start justify-between gap-4 border-b border-stone-900/[0.06] px-5 py-4">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-stone-900">{title}</h2>
        {description ? <p className="mt-0.5 text-xs leading-5 text-stone-500">{description}</p> : null}
      </div>
      {action ? (
        <div className="shrink-0">
          <span className="text-xs font-semibold text-brand-700">{action}</span>
        </div>
      ) : null}
    </header>
  )
}

function MonogramBone({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return <Bone className={cn('shrink-0 rounded-md', size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10')} />
}

function TwoLines({ first = 'w-44', second = 'w-24' }: { first?: string; second?: string }) {
  return (
    <span className="min-w-0 flex-1">
      <TextBone className={first} />
      <TextBone size="xs" className={second} />
    </span>
  )
}

export function OverviewSkeleton() {
  return (
    <SkeletonRegion className="space-y-6">
      <PageHeader
        title={<TextBone size="2xl" className="w-64" boxClassName="h-[37.5px] sm:h-[42.5px]" />}
        description="What needs a reply, where each application stands, and the CVs you send."
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

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {STAT_LABELS.map((label) => (
          <div key={label} className={cn(PANEL, 'p-4 sm:p-5')}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-stone-600">{label}</span>
              <Bone className="h-8 w-8 rounded-lg" />
            </div>
            <span className="mt-2 flex h-9 items-center">
              <Bone className="h-6 w-10" />
            </span>
            <TextBone size="xs" className="w-28" boxClassName="mt-0.5 h-5" />
            <TextBone size="xs" className="w-16" boxClassName="h-5 sm:hidden" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-6">
          <section className={PANEL}>
            <PanelHead
              title="Where your applications stand"
              description="Every application by its current stage. Pick a stage to see those applications."
              action="Open list"
            />
            <div className="p-5">
              <Bone className="h-3 rounded-full" />
              <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {APPLICATION_STATUSES.map((status) => (
                  <li key={status.value} className="flex items-center gap-2.5 rounded-lg border border-white/70 px-3 py-2.5">
                    <Bone className="h-2.5 w-2.5 rounded-full" />
                    <span className="flex-1 text-sm text-stone-700">{status.label}</span>
                    <TextBone className="w-4" />
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className={PANEL}>
            <PanelHead title="Latest applications" action="All applications" />
            <ul className="divide-y divide-stone-900/[0.06]">
              {Array.from({ length: 6 }, (_, i) => (
                <li
                  key={i}
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 px-5 py-3.5 sm:grid-cols-[auto_minmax(0,1fr)_200px_96px_92px]"
                >
                  <MonogramBone />
                  <TwoLines first={i % 2 ? 'w-40' : 'w-52'} />
                  <TextBone size="xs" className="hidden w-36 sm:flex" boxClassName="hidden sm:flex" />
                  <TextBone size="xs" className="w-16" boxClassName="hidden sm:flex" />
                  <span className="flex justify-end">
                    <Bone className="h-[22px] w-[72px] rounded-md" />
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="min-w-0 space-y-6">
          <section className={PANEL}>
            <PanelHead title="Worth a follow-up" description="Applied or in screening for 7 days or more without a new stage." />
            <ul className="divide-y divide-stone-900/[0.06]">
              {Array.from({ length: 3 }, (_, i) => (
                <li key={i} className="flex items-center gap-3 px-5 py-3">
                  <MonogramBone size="sm" />
                  <TwoLines first="w-28" second="w-36" />
                  <Bone className="h-6 w-16 rounded-md" />
                </li>
              ))}
            </ul>
          </section>

          <section className={PANEL}>
            <PanelHead title="Your CVs" action="All CVs" />
            <ul className="divide-y divide-stone-900/[0.06]">
              {Array.from({ length: 3 }, (_, i) => (
                <li key={i} className="flex items-center gap-3.5 px-5 py-3">
                  <Bone className="aspect-[210/297] w-11 rounded-[3px]" />
                  <TwoLines first="w-40" second="w-32" />
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-3 border-t border-stone-900/[0.06] px-5 py-3.5 text-sm">
              <Bone className="h-8 w-8 rounded-lg" />
              <span className="flex-1 font-medium text-stone-800">Cover letters</span>
              <TextBone className="w-4" />
            </div>
          </section>
        </div>
      </div>
    </SkeletonRegion>
  )
}

/* ------------------------------------------------------------------------ */
/* CV list and cover letter list: CVCard / CoverLetterCard grid              */
/* ------------------------------------------------------------------------ */

function CardFooterBone() {
  return (
    <div className="flex items-center gap-1 border-t border-stone-900/[0.06] px-3 py-2">
      <span className="inline-flex h-8 items-center px-2.5 text-xs font-semibold text-brand-700">Edit</span>
      <span className="inline-flex h-8 items-center px-3 text-xs font-semibold text-stone-700">Duplicate</span>
    </div>
  )
}

function DocumentCardBone({ kind }: { kind: 'cv' | 'letter' }) {
  if (kind === 'cv') {
    return (
      <div className={cn(PANEL, 'flex h-full flex-col overflow-hidden')}>
        <div className="flex justify-center border-b border-stone-900/[0.06] bg-gradient-to-br from-brand-50 via-white/60 to-violet-50 px-6 pt-6">
          <Bone className="aspect-[210/297] w-[46%] translate-y-1 rounded-b-none rounded-t-[3px] bg-white" />
        </div>
        <div className="flex flex-1 flex-col px-5 py-4">
          <span className="flex items-start justify-between gap-3">
            <TextBone className="w-44" boxClassName="h-[20.625px]" />
            <Bone className="h-5 w-7 rounded-md" />
          </span>
          <TextBone className="w-52" boxClassName="mt-1" />
          <TextBone size="xs" className="w-36" boxClassName="mt-auto pt-3 h-7" />
        </div>
        <CardFooterBone />
      </div>
    )
  }
  return (
    <div className={cn(PANEL, 'flex h-full flex-col overflow-hidden')}>
      <div className="flex flex-1 flex-col px-5 py-5">
        <div className="flex items-start gap-3">
          <MonogramBone size="lg" />
          <span className="min-w-0 flex-1">
            <TextBone className="w-40" boxClassName="h-[20.625px]" />
            <TextBone className="w-48" boxClassName="mt-0.5" />
          </span>
        </div>
        <div className="mt-4 space-y-2 rounded-lg bg-white/50 px-3 py-2.5" style={{ height: 80 }}>
          <Bone className="h-2.5 w-11/12" />
          <Bone className="h-2.5 w-full" />
          <Bone className="h-2.5 w-3/5" />
        </div>
        <span className="mt-auto flex items-center gap-2 pt-4">
          <Bone className="h-5 w-28 rounded-md" />
          <TextBone size="xs" className="w-24" />
        </span>
      </div>
      <CardFooterBone />
    </div>
  )
}

export function DocumentListSkeleton({ kind }: { kind: 'cv' | 'letter' }) {
  const isCV = kind === 'cv'
  return (
    <SkeletonRegion className="space-y-6">
      <PageHeader
        title={isCV ? 'CVs' : 'Cover letters'}
        description={
          isCV
            ? 'Keep one version per kind of role. Duplicate a CV to tailor it without losing the original.'
            : 'Letters and email bodies for specific applications. Fill in your details from a saved CV.'
        }
        actions={
          <GhostButton>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {isCV ? 'New CV' : 'New cover letter'}
          </GhostButton>
        }
      />
      {isCV ? <TextBone className="w-48" boxClassName="h-5" /> : null}
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 3 }, (_, i) => (
          <li key={i}>
            <DocumentCardBone kind={kind} />
          </li>
        ))}
        <li>
          <div
            className={cn(
              'flex h-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-stone-900/10 px-6 py-8 text-center',
              isCV ? 'min-h-[200px]' : 'min-h-[180px]'
            )}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-700 ring-1 ring-stone-200">
              <Plus className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold text-stone-900">{isCV ? 'New CV' : 'New cover letter'}</span>
            <span className="max-w-[220px] text-xs leading-5 text-stone-500">
              {isCV ? 'Start blank, or duplicate an existing CV to tailor it for one role.' : 'Pick a format, then fill it from one of your CVs.'}
            </span>
          </div>
        </li>
      </ul>
    </SkeletonRegion>
  )
}

/* ------------------------------------------------------------------------ */
/* Applications: ApplicationList + ApplicationCard                           */
/* ------------------------------------------------------------------------ */

const APP_GRID = 'lg:grid-cols-[minmax(0,1fr)_minmax(0,200px)_120px_232px]'

export function ApplicationsSkeleton() {
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
      <div className={cn(PANEL, 'overflow-hidden')}>
        <div className="flex flex-col gap-3 border-b border-stone-900/[0.06] px-4 pt-4 sm:px-5">
          <span className="relative block w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
            <InputBone empty />
          </span>
          <div className="scrollbar-none -mx-1 overflow-x-auto px-1">
            <div className="flex min-w-max gap-1">
              {['All', ...APPLICATION_STATUSES.map((s) => s.label)].map((label, i) => (
                <span
                  key={label}
                  className={cn(
                    '-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium',
                    i === 0 ? 'border-brand-700 text-stone-900' : 'border-transparent text-stone-500'
                  )}
                >
                  {label}
                  <Bone className="h-[18px] w-5 rounded-md" />
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className={cn('hidden gap-4 border-b border-stone-900/[0.06] bg-white/50/70 px-5 py-2.5 text-xs font-medium text-stone-500 lg:grid', APP_GRID)}>
          <span>Position and company</span>
          <span>CV sent</span>
          <span>Date applied</span>
          <span>Stage</span>
        </div>
        <ul className="divide-y divide-stone-900/[0.06]">
          {Array.from({ length: 5 }, (_, i) => (
            <li key={i} className={cn('grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-3 px-4 py-4 sm:px-5 lg:items-center lg:gap-4', APP_GRID)}>
              <div className="col-span-2 flex min-w-0 items-start gap-3 lg:col-span-1 lg:items-center">
                <MonogramBone />
                <span className="min-w-0 flex-1">
                  <TextBone className={i % 2 ? 'w-40' : 'w-56'} />
                  <TextBone className="w-28" />
                </span>
              </div>
              <div className="col-start-2 flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 lg:col-start-auto lg:contents">
                <TextBone size="xs" className="w-36" />
                <TextBone size="xs" className="w-20" />
              </div>
              <div className="col-start-2 flex items-center gap-1 lg:col-start-auto">
                <InputBone className="h-9 flex-1 rounded-lg lg:w-[136px] lg:flex-none" />
                <Bone className="h-9 w-9 rounded-lg" />
                <Bone className="h-9 w-9 rounded-lg" />
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

const STAGES = APPLICATION_STATUSES.filter((status) => status.value !== 'rejected')

export function ApplicationFormSkeleton({ editing }: { editing: boolean }) {
  return (
    <SkeletonRegion className="space-y-5">
      <span className="inline-flex items-center gap-1 text-sm font-medium text-stone-600">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Applications
      </span>
      <div>
        {editing ? (
          <>
            <TextBone size="2xl" className="w-80 max-w-full" boxClassName="h-[32.5px]" />
            <TextBone size="2xl" className="w-40" boxClassName="h-[32.5px] sm:hidden" />
          </>
        ) : (
          <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-stone-900">Add application</h1>
        )}
        <p className="mt-1.5 text-sm text-stone-600">
          {editing ? 'Update the stage, the CV you sent, or your notes.' : 'Record the job, the date you applied and the CV you sent.'}
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className={PANEL}>
          <div className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-2">
            <Field label="Position" required>
              <InputBone empty={!editing} />
            </Field>
            <Field label="Company" required>
              <InputBone empty={!editing} />
            </Field>
            <Field label="Job posting link" optional className="sm:col-span-2">
              <InputBone empty />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 border-t border-stone-900/[0.06] px-5 py-5 sm:grid-cols-3">
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
          <div className="border-t border-stone-900/[0.06] px-5 py-5">
            <Field label="Notes" optional hint="Recruiter contact, interview dates, salary range, what to follow up on.">
              <TextareaBone rows={5} empty={!editing} />
            </Field>
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-stone-900/[0.06] px-5 py-4">
            <GhostButton variant="outline">Cancel</GhostButton>
            <GhostButton>{editing ? 'Save changes' : 'Add application'}</GhostButton>
          </div>
        </div>

        <aside className="space-y-4">
          <section className={cn(PANEL, 'p-5')}>
            <h2 className="text-sm font-semibold text-stone-900">Progress</h2>
            <ol className="mt-4">
              {STAGES.map((stage) => (
                <li key={stage.value} className="flex gap-3 pb-4 last:pb-0">
                  <Bone className="mt-0.5 h-5 w-5 rounded-full" />
                  <span className="text-sm text-stone-400">{stage.label}</span>
                </li>
              ))}
            </ol>
          </section>
          <section className={cn(PANEL, 'p-5')}>
            <h2 className="text-sm font-semibold text-stone-900">CV sent</h2>
            <div className="mt-3 flex items-center gap-3 rounded-lg border border-white/70 p-3">
              <Bone className="aspect-[210/297] w-12 rounded-[3px]" />
              <TwoLines first="w-40" second="w-16" />
            </div>
          </section>
        </aside>
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
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/70 bg-white/60 text-stone-700 shadow-[0_1px_1px_rgba(28,25,23,0.04)]">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            {editing ? <TextBone size="xl" className="w-56" /> : <h1 className="text-xl font-semibold text-stone-900">New CV</h1>}
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

      <div className="grid grid-cols-2 rounded-full border border-white/70 bg-white/40 p-1 backdrop-blur-md lg:hidden">
        <span className="rounded-full bg-white/90 py-2 text-center text-sm font-semibold text-stone-900 shadow-sm">Edit</span>
        <span className="py-2 text-center text-sm font-semibold text-stone-600">Preview</span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-5">
          <div className="scrollbar-none -mx-1 overflow-x-auto px-1">
            <ul className="flex min-w-max gap-1 border-b border-stone-900/10">
              {CV_SECTIONS.map((label) => (
                <li
                  key={label}
                  className={`-mb-px border-b-2 px-3 py-2.5 text-sm font-medium ${
                    label === 'Personal' ? 'border-brand-800 text-stone-900' : 'border-transparent text-stone-600'
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
            <div className="border-t border-white/70 pt-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <span className="h-20 w-20 shrink-0 rounded-full border border-white/70 bg-stone-900/[0.05]" />
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
                    <span className="text-xs font-medium text-brand-800">Use an image URL</span>
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

        <div className="hidden min-w-0 lg:sticky lg:top-8 lg:block lg:self-start">
          <section className="flex flex-col overflow-hidden rounded-3xl glass/35 lg:h-[calc(100vh-4rem)]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/60 bg-white/50 px-3 py-2 backdrop-blur-md">
              <div className="flex rounded-lg border border-white/70 bg-stone-900/[0.05] p-0.5">
                {TEMPLATES_METADATA.map((tmpl) => (
                  <span key={tmpl.id} className="rounded px-2.5 py-1 text-xs font-semibold text-stone-600" data-no-translate>
                    {tmpl.name}
                  </span>
                ))}
              </div>
              <span className="h-8 w-28 rounded-xl border border-white/70 bg-white/60" />
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
      <div className="flex flex-col gap-4 border-b border-stone-900/10 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1 text-sm font-medium text-stone-600">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Cover letters
          </span>
          {editing ? (
            <TextBone size="2xl" className="w-56" boxClassName="mt-1" />
          ) : (
            <h1 className="mt-1 text-2xl font-semibold text-stone-900">New cover letter</h1>
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

      <div className="grid grid-cols-2 rounded-full border border-white/70 bg-white/40 p-1 backdrop-blur-md lg:hidden">
        <span className="rounded-full bg-white/90 py-2 text-center text-sm font-semibold text-stone-900 shadow-sm">Edit</span>
        <span className="py-2 text-center text-sm font-semibold text-stone-600">Preview</span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)]">
        <div className="space-y-5">
          <EditorSection title="Format">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {COVER_LETTER_TEMPLATES.map((tmpl) => (
                <div key={tmpl.id} className="rounded-xl border border-white/70 bg-white/60 px-3.5 py-3">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold text-stone-900">{tmpl.name}</span>
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
            <div className="flex flex-col gap-2 border-t border-white/70 pt-4 sm:flex-row sm:items-start">
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
          <div className="space-y-2 lg:sticky lg:top-8">
            <p className="text-sm font-medium text-stone-700">Preview</p>
            <div className="space-y-4 rounded-md bg-white p-6 shadow-[0_8px_24px_-12px_rgba(28,25,23,0.25)] ring-1 ring-stone-200 sm:p-8">
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
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-6">
        <EditorSection title="Profile" description="Your name is used as the default sender on new cover letters.">
          <div className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <span className="h-20 w-20 shrink-0 rounded-full border border-white/70 bg-stone-900/[0.05]" />
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
            <div className="flex items-center justify-between gap-4 border-t border-white/70 pt-4">
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
            <div className="flex justify-end border-t border-white/70 pt-4">
              <GhostButton variant="outline">Change password</GhostButton>
            </div>
          </div>
        </EditorSection>
      </div>

      <aside className="space-y-4">
        <section className={PANEL}>
          <PanelHead title="In your account" />
          <div className="divide-y divide-stone-900/[0.06]">
            {['CVs', 'Applications', 'Cover letters'].map((label) => (
              <div key={label} className="flex items-center justify-between px-5 py-3 text-sm">
                <span className="text-stone-700">{label}</span>
                <TextBone className="w-4" />
              </div>
            ))}
          </div>
        </section>
        <section className={PANEL}>
          <PanelHead title="Signed in as" />
          <div className="space-y-1 px-5 py-4 text-sm">
            <TextBone className="w-44" />
            <TextBone size="xs" className="w-36" />
          </div>
        </section>
      </aside>
      </div>
    </SkeletonRegion>
  )
}
