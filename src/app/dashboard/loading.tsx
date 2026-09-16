import React from 'react'
import DashboardShell from '@/components/layout/dashboard-shell'

export default function DashboardLoading() {
  return (
    <DashboardShell>
      <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading dashboard metrics and activity">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 rounded-md bg-slate-200" />
            <div className="h-4 w-72 rounded-md bg-slate-200" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-28 rounded-lg bg-slate-200" />
            <div className="h-10 w-36 rounded-lg bg-slate-200" />
          </div>
        </div>

        {/* Metrics Grid Skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="flex h-28 flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 rounded bg-slate-200" />
                <div className="h-8 w-8 rounded-lg bg-slate-200" />
              </div>
              <div className="h-8 w-12 rounded bg-slate-200" />
            </div>
          ))}
        </div>

        {/* Recent Activity Skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="flex h-80 flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="h-5 w-32 rounded bg-slate-200" />
                  <div className="h-3 w-44 rounded bg-slate-200" />
                </div>
                <div className="h-4 w-16 rounded bg-slate-200" />
              </div>
              <div className="mt-4 space-y-4">
                {[1, 2, 3].map((row) => (
                  <div key={row} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-slate-200" />
                      <div className="space-y-1.5">
                        <div className="h-4 w-32 rounded bg-slate-200" />
                        <div className="h-3 w-20 rounded bg-slate-200" />
                      </div>
                    </div>
                    <div className="h-6 w-14 rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  )
}
