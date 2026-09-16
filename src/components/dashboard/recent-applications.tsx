import React from 'react'
import Link from 'next/link'
import type { JobApplicationWithCV } from '@/types/application'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/applications/status-badge'
import { Button } from '@/components/ui/button'
import { Briefcase, Plus, ArrowRight, Calendar, ExternalLink } from 'lucide-react'

interface RecentApplicationsProps {
  applications: JobApplicationWithCV[]
}

export function RecentApplications({ applications }: RecentApplicationsProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-lg font-semibold text-slate-900">Recent Applications</CardTitle>
          <p className="text-xs text-slate-500">Your latest job applications and status</p>
        </div>
        {applications.length > 0 && (
          <Link
            href="/dashboard/applications"
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            <span>View all</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        {applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <Briefcase className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900">No Applications Logged</h4>
            <p className="mt-1 max-w-xs text-xs text-slate-500">
              Track your applications, interview dates, and offers in one organized dashboard.
            </p>
            <Link href="/dashboard/applications/new" className="mt-4">
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                <span>Add Application</span>
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {applications.map((app) => {
              const formattedDate = new Date(app.applied_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })

              return (
                <div
                  key={app.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <div>
                      <Link
                        href={`/dashboard/applications/${app.id}`}
                        className="font-medium text-slate-900 hover:text-blue-600 hover:underline line-clamp-1 text-sm"
                      >
                        {app.position}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-medium text-slate-700">{app.company_name}</span>
                        {app.cv && (
                          <span className="text-slate-400">
                            • CV: <span className="text-slate-600">{app.cv.name}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar className="h-3 w-3" />
                          {formattedDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={app.status} />
                    <Link
                      href={`/dashboard/applications/${app.id}`}
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      aria-label={`View ${app.position} at ${app.company_name}`}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Details</span>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
