import React from 'react'
import { APPLICATION_STATUSES, type ApplicationStatus } from '@/types/application'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: ApplicationStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = APPLICATION_STATUSES.find((s) => s.value === status) || {
    value: status,
    label: status.charAt(0).toUpperCase() + status.slice(1),
    color: 'bg-slate-100 text-slate-700 border-slate-200',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize',
        statusConfig.color,
        className
      )}
    >
      {statusConfig.label}
    </span>
  )
}
