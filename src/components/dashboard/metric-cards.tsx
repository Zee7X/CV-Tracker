import React from 'react'
import Link from 'next/link'
import type { DashboardMetrics } from '@/types/dashboard'

interface MetricCardsProps {
  metrics: DashboardMetrics
}

// One bordered strip instead of four floating cards: the numbers are counts,
// not KPIs, and read faster side by side.
export function MetricCards({ metrics }: MetricCardsProps) {
  const items = [
    { label: 'Applications', value: metrics.totalApplications, href: '/dashboard/applications' },
    { label: 'Interviews', value: metrics.interviewCount, href: '/dashboard/applications' },
    { label: 'Offers', value: metrics.offersCount, href: '/dashboard/applications' },
    { label: 'CVs', value: metrics.totalCVs, href: '/dashboard/cv' },
  ]

  return (
    <dl className="grid grid-cols-2 overflow-hidden rounded-lg border border-stone-300 bg-white sm:grid-cols-4">
      {items.map((item, idx) => (
        <Link
          key={item.label}
          href={item.href}
          className={`block px-5 py-4 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-800 ${
            idx % 2 === 1 ? 'border-l border-stone-200' : ''
          } ${idx >= 2 ? 'border-t border-stone-200 sm:border-t-0' : ''} ${idx === 2 ? 'sm:border-l' : ''}`}
        >
          <dt className="text-sm text-stone-600">{item.label}</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-stone-950">{item.value}</dd>
        </Link>
      ))}
    </dl>
  )
}
