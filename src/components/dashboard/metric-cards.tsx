import React from 'react'
import Link from 'next/link'
import type { DashboardMetrics } from '@/types/dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Briefcase, Calendar, Award, ArrowUpRight } from 'lucide-react'

interface MetricCardsProps {
  metrics: DashboardMetrics
}

export function MetricCards({ metrics }: MetricCardsProps) {
  const cards = [
    {
      title: 'Total CVs',
      value: metrics.totalCVs,
      description: 'Active CV profiles',
      href: '/dashboard/cv',
      icon: FileText,
      iconBg: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Total Applications',
      value: metrics.totalApplications,
      description: 'Tracked job searches',
      href: '/dashboard/applications',
      icon: Briefcase,
      iconBg: 'bg-indigo-50 text-indigo-600',
    },
    {
      title: 'Interviews',
      value: metrics.interviewCount,
      description: 'In interview stage',
      href: '/dashboard/applications',
      icon: Calendar,
      iconBg: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Offers',
      value: metrics.offersCount,
      description: 'Job offers received',
      href: '/dashboard/applications',
      icon: Award,
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const IconComponent = card.icon
        return (
          <Link
            key={card.title}
            href={card.href}
            className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <Card className="transition-colors hover:border-stone-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {card.title}
                </CardTitle>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.iconBg}`}>
                  <IconComponent className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-bold tracking-tight text-slate-900">
                    {card.value}
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                </div>
                <p className="mt-1 text-xs text-slate-500">{card.description}</p>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
