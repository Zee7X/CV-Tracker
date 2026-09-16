import React from 'react'
import DashboardShell from '@/components/layout/dashboard-shell'

export default function ApplicationsLoading() {
  return (
    <DashboardShell>
      <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading applications">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 rounded-md bg-slate-200" />
            <div className="h-4 w-72 rounded-md bg-slate-200" />
          </div>
          <div className="h-10 w-36 rounded-lg bg-slate-200" />
        </div>

        {/* Filter / Search Bar Skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="h-10 w-full max-w-md rounded-md bg-slate-200" />
          <div className="h-8 w-64 rounded-full bg-slate-200" />
        </div>

        {/* Grid Skeletons */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="flex h-56 flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-200" />
                    <div className="space-y-1.5">
                      <div className="h-4 w-28 rounded bg-slate-200" />
                      <div className="h-3 w-20 rounded bg-slate-200" />
                    </div>
                  </div>
                  <div className="h-5 w-16 rounded-full bg-slate-200" />
                </div>
                <div className="h-3 w-32 rounded bg-slate-200" />
                <div className="h-12 w-full rounded-lg bg-slate-100" />
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="h-8 w-24 rounded-md bg-slate-200" />
                <div className="flex gap-2">
                  <div className="h-8 w-12 rounded bg-slate-200" />
                  <div className="h-8 w-8 rounded bg-slate-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  )
}
