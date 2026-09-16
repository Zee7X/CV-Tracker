import * as React from 'react'
import { cn } from '@/lib/utils'

interface FieldProps {
  label: string
  htmlFor: string
  error?: string
  children: React.ReactNode
  className?: string
}

/** Accessible label + input wrapper used across auth forms. */
export function Field({ label, htmlFor, error, children, className }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

interface AlertProps {
  kind: 'error' | 'success'
  message: string
}

/** Accessible status banner for server action results. */
export function AuthAlert({ kind, message }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-lg px-4 py-3 text-sm',
        kind === 'error'
          ? 'bg-red-50 text-red-700 border border-red-200'
          : 'border border-blue-200 bg-blue-50 text-blue-800'
      )}
    >
      {message}
    </div>
  )
}
