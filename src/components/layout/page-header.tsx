import React from 'react'
import { cn } from '@/lib/utils'

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        <h1 className="font-display text-[28px] font-semibold leading-tight tracking-[-0.025em] text-slate-900 sm:text-[32px]">{title}</h1>
        {description ? <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div> : null}
    </div>
  )
}

/** White panel used for every grouped block in the dashboard. */
export function Panel({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section className={cn('rounded-3xl border border-slate-200/80 bg-white shadow-xs', className)}>
      {title ? (
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
            {description ? <p className="mt-0.5 text-xs text-slate-500">{description}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      ) : null}
      <div className={bodyClassName}>{children}</div>
    </section>
  )
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  compact = false,
}: {
  title: string
  description: React.ReactNode
  action?: React.ReactNode
  icon?: React.ReactNode
  compact?: boolean
}) {
  return (
    <div
      className={`rounded-3xl border border-dashed border-slate-300 bg-white/70 text-center shadow-xs ${compact ? 'px-4 py-8' : 'px-6 py-16'}`}
    >
      {icon ? (
        <div className="orb mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full text-white">{icon}</div>
      ) : null}
      <h2 className={`${compact ? 'text-sm' : 'text-lg'} font-semibold text-slate-900`}>{title}</h2>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  )
}
