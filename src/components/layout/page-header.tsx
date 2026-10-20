import React from 'react'

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-stone-300 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold text-stone-950">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-stone-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
  compact = false,
}: {
  title: string
  description: React.ReactNode
  action?: React.ReactNode
  compact?: boolean
}) {
  return (
    <div
      className={`rounded-lg border border-dashed border-stone-300 bg-[#fffefa] text-center ${compact ? 'px-4 py-8' : 'px-6 py-14'}`}
    >
      <h2 className={`${compact ? 'text-sm' : 'text-lg'} font-semibold text-stone-950`}>{title}</h2>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-stone-600">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  )
}
