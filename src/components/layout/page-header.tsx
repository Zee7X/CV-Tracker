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
        <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-stone-950">{title}</h1>
        {description ? <p className="mt-1.5 max-w-2xl text-sm leading-6 text-stone-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
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
    <section className={cn('rounded-xl border border-stone-200 bg-white shadow-[0_1px_2px_rgba(28,25,23,0.04)]', className)}>
      {title ? (
        <header className="flex items-start justify-between gap-4 border-b border-stone-100 px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-stone-950">{title}</h2>
            {description ? <p className="mt-0.5 text-xs leading-5 text-stone-500">{description}</p> : null}
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
      className={`rounded-xl border border-dashed border-stone-300 bg-white text-center ${compact ? 'px-4 py-8' : 'px-6 py-16'}`}
    >
      {icon ? (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">{icon}</div>
      ) : null}
      <h2 className={`${compact ? 'text-sm' : 'text-lg'} font-semibold text-stone-950`}>{title}</h2>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-stone-600">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  )
}
