import React from 'react'
import Link from 'next/link'
import { ArrowUpRight, BriefcaseBusiness, CalendarClock, Check, FileText, Mail, MessageSquareReply, Send, Users } from 'lucide-react'
import type { CV } from '@/types/cv'
import type { JobApplicationWithCV } from '@/types/application'
import { APPLICATION_STATUSES } from '@/types/application'
import { FOLLOW_UP_AFTER_DAYS, type summarize } from '@/lib/dashboard/queries'
import { TEMPLATE_NAMES } from '@/lib/format'
import { Panel } from '@/components/layout/page-header'
import { StatusBadge } from '@/components/applications/status-badge'
import { LocalDate } from '@/components/i18n/local-date'
import { Monogram } from '@/components/ui/monogram'
import { ButtonLink } from '@/components/ui/button-link'
import { CVThumbnail } from '@/components/cv/cv-thumbnail'

type Summary = ReturnType<typeof summarize>

const linkClass = 'text-xs font-semibold text-brand-600 underline-offset-4 hover:underline'

/* Stat strip: real counts only, each with the sentence that explains it. */
export function StatStrip({ summary }: { summary: Summary }) {
  const items = [
    {
      label: 'Applications',
      value: summary.total,
      note: (
        <>
          <span className="tabular-nums" data-no-translate>{summary.last30}</span> <span>in the last 30 days</span>
        </>
      ),
      icon: Send,
      href: '/dashboard/applications',
    },
    {
      label: 'Still open',
      value: summary.open,
      note: <span>Waiting on a reply or in progress</span>,
      icon: BriefcaseBusiness,
      href: '/dashboard/applications?status=applied',
    },
    {
      label: 'Interviews',
      value: summary.interviews,
      note: (
        <>
          <span className="tabular-nums" data-no-translate>{summary.offers}</span> <span>{summary.offers === 1 ? 'offer so far' : 'offers so far'}</span>
        </>
      ),
      icon: Users,
      href: '/dashboard/applications?status=interview',
    },
    {
      label: 'Response rate',
      value: summary.responseRate === null ? '–' : `${summary.responseRate}%`,
      note: <span>Applications that moved past Applied</span>,
      icon: MessageSquareReply,
      href: '/dashboard/applications',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.label}
            href={item.href}
            className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{item.label}</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-2 text-[30px] font-bold leading-9 tabular-nums tracking-tight text-slate-900" data-no-translate>
              {item.value}
            </p>
            <p className="mt-1 text-xs text-slate-500">{item.note}</p>
          </Link>
        )
      })}
    </div>
  )
}

const BAR_COLORS: Record<string, string> = {
  applied: 'bg-slate-400',
  screening: 'bg-amber-400',
  interview: 'bg-brand-600',
  offering: 'bg-emerald-500',
  accepted: 'bg-emerald-700',
  rejected: 'bg-slate-200',
}

/* Where every application stands, as one bar plus a clickable legend. */
export function Pipeline({ summary }: { summary: Summary }) {
  return (
    <Panel
      title="Where your applications stand"
      description="Every application by its current stage. Pick a stage to see those applications."
      action={
        <Link href="/dashboard/applications" className={linkClass}>
          Open list
        </Link>
      }
      bodyClassName="p-5"
    >
      {summary.total === 0 ? (
        <div className="space-y-3">
          <div className="h-3 rounded-full bg-slate-100" />
          <p className="text-sm text-slate-500">Stages appear here once you log your first application.</p>
        </div>
      ) : (
        <>
          <div className="flex h-3 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
            {APPLICATION_STATUSES.map((status) => {
              const count = summary.byStatus[status.value] ?? 0
              if (!count) return null
              return (
                <span
                  key={status.value}
                  className={`${BAR_COLORS[status.value]} border-r-2 border-white last:border-r-0`}
                  style={{ width: `${(count / summary.total) * 100}%` }}
                />
              )
            })}
          </div>
          <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {APPLICATION_STATUSES.map((status) => {
              const count = summary.byStatus[status.value] ?? 0
              return (
                <li key={status.value}>
                  <Link
                    href={`/dashboard/applications?status=${status.value}`}
                    className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 px-3 py-2.5 transition-colors hover:border-slate-300 hover:bg-slate-100/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                  >
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${BAR_COLORS[status.value]}`} aria-hidden="true" />
                    <span className="flex-1 text-xs font-semibold text-slate-700">{status.label}</span>
                    <span className="text-xs font-bold tabular-nums text-slate-900" data-no-translate>
                      {count}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </Panel>
  )
}

/* Applications that have waited long enough to deserve a follow-up message. */
export function FollowUps({ items }: { items: Summary['followUps'] }) {
  const shown = items.slice(0, 5)
  return (
    <Panel
      title="Worth a follow-up"
      description={
        <>
          {`Applied or in screening for ${FOLLOW_UP_AFTER_DAYS} days or more without a new stage.`}
        </>
      }
    >
      {shown.length === 0 ? (
        <div className="flex items-start gap-3 px-5 py-5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <Check className="h-4 w-4" aria-hidden="true" />
          </span>
          <p className="text-sm leading-6 text-slate-600">Nothing to chase right now. Older applications that are still waiting show up here.</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {shown.map(({ app, days }) => (
            <li key={app.id}>
              <Link
                href={`/dashboard/applications/${app.id}`}
                className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-600"
              >
                <Monogram name={app.company_name} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-900" data-no-translate>
                    {app.company_name}
                  </span>
                  <span className="block truncate text-xs text-slate-500" data-no-translate>
                    {app.position}
                  </span>
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
                  <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="tabular-nums" data-no-translate>{days}</span>
                  <span>days</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {items.length > shown.length ? (
        <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
          <span data-no-translate>+{items.length - shown.length}</span> <span>more in the applications list</span>
        </div>
      ) : null}
    </Panel>
  )
}

export function RecentApplicationsPanel({ applications }: { applications: JobApplicationWithCV[] }) {
  const rows = applications.slice(0, 6)
  return (
    <Panel
      title="Latest applications"
      action={
        applications.length > 0 ? (
          <Link href="/dashboard/applications" className={linkClass}>
            All applications
          </Link>
        ) : null
      }
    >
      {rows.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-sm font-semibold text-slate-800">No applications logged yet.</p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
            Record each job you apply to so you know which CV you sent and when to follow up.
          </p>
          <ButtonLink href="/dashboard/applications/new" size="sm" className="mt-4 rounded-full">
            Add application
          </ButtonLink>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {rows.map((app) => (
            <li key={app.id}>
              <Link
                href={`/dashboard/applications/${app.id}`}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 px-5 py-3.5 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-600 sm:grid-cols-[auto_minmax(0,1fr)_200px_96px_92px]"
              >
                <Monogram name={app.company_name} size="sm" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-900" data-no-translate>
                    {app.position}
                  </span>
                  <span className="block truncate text-xs text-slate-500" data-no-translate>
                    {app.company_name}
                  </span>
                </span>
                <span className="hidden min-w-0 items-center gap-1.5 truncate text-xs text-slate-500 sm:flex">
                  <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                  {app.cv ? (
                    <span className="truncate" data-no-translate>
                      {app.cv.name}
                    </span>
                  ) : (
                    <span>No CV linked</span>
                  )}
                </span>
                <span className="hidden text-xs tabular-nums text-slate-500 sm:block">
                  <LocalDate value={app.applied_date} />
                </span>
                <span className="flex justify-end">
                  <StatusBadge status={app.status} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

export function CVShelf({ cvs, letterCount }: { cvs: CV[]; letterCount: number }) {
  const shown = cvs.slice(0, 3)
  return (
    <Panel
      title="Your CVs"
      action={
        cvs.length > 0 ? (
          <Link href="/dashboard/cv" className={linkClass}>
            All CVs
          </Link>
        ) : null
      }
    >
      {shown.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-sm font-semibold text-slate-800">No CVs yet.</p>
          <p className="mt-1 text-xs text-slate-500">Create one, then attach it to the applications you send.</p>
          <ButtonLink href="/dashboard/cv/new" size="sm" className="mt-4 rounded-full">
            Create CV
          </ButtonLink>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {shown.map((cv) => (
            <li key={cv.id}>
              <Link
                href={`/dashboard/cv/${cv.id}`}
                className="flex items-center gap-3.5 px-5 py-3 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-600"
              >
                <CVThumbnail cv={cv} className="w-11" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-900" data-no-translate>
                    {cv.name}
                  </span>
                  <span className="block truncate text-xs text-slate-500">
                    <span data-no-translate>{TEMPLATE_NAMES[cv.template] ?? cv.template}</span>
                    <span aria-hidden="true"> · </span>
                    <span>Edited</span> <LocalDate value={cv.updated_at} />
                  </span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/dashboard/cover-letters"
        className="flex items-center gap-3 border-t border-slate-100 px-5 py-3.5 text-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-600"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
          <Mail className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="flex-1 text-xs font-semibold text-slate-800">Cover letters</span>
        <span className="text-xs font-bold tabular-nums text-slate-900" data-no-translate>
          {letterCount}
        </span>
      </Link>
    </Panel>
  )
}

/* First-run guide built from the account's real state, so finished steps are ticked. */
export function GettingStarted({ hasCV, hasApplication, hasLetter }: { hasCV: boolean; hasApplication: boolean; hasLetter: boolean }) {
  const steps = [
    {
      done: hasCV,
      title: 'Write your first CV',
      copy: 'Contact details, experience and skills, with a live A4 preview and PDF download.',
      href: '/dashboard/cv/new',
      cta: 'Create CV',
    },
    {
      done: hasApplication,
      title: 'Log a job you applied to',
      copy: 'Company, role, posting link and the CV you sent, so you know what went where.',
      href: '/dashboard/applications/new',
      cta: 'Add application',
    },
    {
      done: hasLetter,
      title: 'Prepare a cover letter',
      copy: 'Formal Indonesian, professional English or a short email body, filled from your CV.',
      href: '/dashboard/cover-letters/new',
      cta: 'Write letter',
    },
  ]
  const doneCount = steps.filter((step) => step.done).length

  return (
    <Panel
      title="Set up your job search"
      description={
        <>
          <span data-no-translate>{doneCount}/3</span> <span>steps done</span>
        </>
      }
      bodyClassName="grid gap-px overflow-hidden rounded-b-2xl bg-slate-100 md:grid-cols-3"
    >
      {steps.map((step, index) => (
        <div key={step.title} className="flex flex-col bg-white p-5">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
              step.done ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
            aria-hidden="true"
          >
            {step.done ? <Check className="h-4 w-4" /> : index + 1}
          </span>
          <h3 className={`mt-3 text-sm font-semibold ${step.done ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-900'}`}>
            {step.title}
          </h3>
          <p className="mt-1 flex-1 text-xs leading-5 text-slate-500">{step.copy}</p>
          {step.done ? (
            <span className="mt-4 text-xs font-semibold text-emerald-700">Done</span>
          ) : (
            <ButtonLink href={step.href} size="sm" variant="outline" className="mt-4 self-start rounded-full">
              {step.cta}
            </ButtonLink>
          )}
        </div>
      ))}
    </Panel>
  )
}
