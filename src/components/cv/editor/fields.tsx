import React from 'react'

// Small layout primitives shared by every editor section so labels, hints,
// errors and spacing stay identical across the form.

export function EditorSection({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-3xl glass">
      <header className="flex flex-col gap-3 border-b border-slate-900/[0.06] px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {description ? <p className="mt-1 max-w-prose text-sm text-slate-600">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      <div className="space-y-4 px-5 py-5">{children}</div>
    </section>
  )
}

export function EntryCard({
  heading,
  actions,
  children,
}: {
  heading: string
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="rounded-md border border-surface/70 bg-surface/50/60">
      <div className="flex items-center justify-between gap-2 border-b border-surface/70 py-1.5 pl-4 pr-1.5">
        <h3 className="min-w-0 truncate text-sm font-semibold text-slate-900">{heading}</h3>
        {actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="text-xs font-medium text-red-700" role="alert">
      {message}
    </p>
  )
}

export function Field({
  id,
  label,
  required,
  optional,
  hint,
  error,
  className = '',
  children,
}: {
  id: string
  label: string
  required?: boolean
  optional?: boolean
  hint?: string
  error?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-800">
        {label}
        {required ? (
          <span className="text-red-700" aria-hidden="true">
            {' '}
            *
          </span>
        ) : null}
        {optional ? <span className="font-normal text-slate-500"> (optional)</span> : null}
      </label>
      {children}
      {hint && !error ? <p className="text-xs text-slate-500">{hint}</p> : null}
      <FieldError message={error} />
    </div>
  )
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className = '', ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={`block w-full rounded-xl border border-slate-900/10 bg-surface/80 shadow-[inset_0_1px_2px_rgba(120,60,80,0.06)] hover:bg-surface/85 focus-visible:border-brand-400 focus-visible:bg-surface focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-500/20 transition-colors px-3 py-2 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      />
    )
  }
)
