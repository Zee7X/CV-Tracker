import React from 'react'
import DashboardShell from '@/components/layout/dashboard-shell'

export default function CVLoading() {
  return (
    <DashboardShell>
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 rounded-md bg-slate-200" />
            <div className="h-4 w-72 rounded-md bg-slate-200" />
          </div>
          <div className="h-10 w-32 rounded-lg bg-slate-200" />
        </div>

        {/* Grid Skeletons */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex h-56 flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-32 rounded bg-slate-200" />
                  <div className="h-5 w-16 rounded-full bg-slate-200" />
                </div>
                <div className="h-4 w-24 rounded bg-slate-200" />
                <div className="h-12 w-full rounded bg-slate-100" />
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-3">
                <div className="h-4 w-16 rounded bg-slate-200" />
                <div className="h-4 w-12 rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  )
}
