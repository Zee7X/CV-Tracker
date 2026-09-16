import React from 'react'
import Link from 'next/link'
import type { CV } from '@/types/cv'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Plus, ArrowRight, Calendar, Edit3 } from 'lucide-react'

interface RecentCVsProps {
  cvs: CV[]
}

export function RecentCVs({ cvs }: RecentCVsProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-lg font-semibold text-slate-900">Recent CVs</CardTitle>
          <p className="text-xs text-slate-500">Your most recently updated CVs</p>
        </div>
        {cvs.length > 0 && (
          <Link
            href="/dashboard/cv"
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            <span>View all</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        {cvs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <FileText className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900">No CVs Created Yet</h4>
            <p className="mt-1 max-w-xs text-xs text-slate-500">
              Build your first tailored CV using ATS or modern templates to start applying.
            </p>
            <Link href="/dashboard/cv/new" className="mt-4">
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                <span>Create CV</span>
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {cvs.map((cv) => {
              const formattedDate = new Date(cv.updated_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })

              const templateVariant =
                cv.template === 'ats'
                  ? 'default'
                  : cv.template === 'modern'
                    ? 'secondary'
                    : 'outline'

              return (
                <div
                  key={cv.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <Link
                        href={`/dashboard/cv/${cv.id}`}
                        className="font-medium text-slate-900 hover:text-blue-600 hover:underline line-clamp-1 text-sm"
                      >
                        {cv.name}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Badge variant={templateVariant} className="text-[10px] px-1.5 py-0 capitalize font-normal">
                          {cv.template}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formattedDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/cv/${cv.id}`}
                    className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    aria-label={`Edit ${cv.name}`}
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Edit</span>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
