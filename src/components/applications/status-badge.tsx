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
    color: 'bg-stone-900/[0.05] text-stone-700 border-stone-900/10',
  }

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded border px-2 py-0.5 text-xs font-medium',
        statusConfig.color,
        className
      )}
    >
      {statusConfig.label}
    </span>
  )
}
