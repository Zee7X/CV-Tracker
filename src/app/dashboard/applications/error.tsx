'use client'

import React, { useEffect } from 'react'
import DashboardShell from '@/components/layout/dashboard-shell'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ApplicationsError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Applications Dashboard error:', error)
  }, [error])

  return (
    <DashboardShell>
      <div
        role="alert"
        aria-live="assertive"
        className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50/50 p-8 text-center"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-slate-900">Something went wrong</h2>
        <p className="mt-1 max-w-md text-sm text-slate-600">
          {error.message || 'An error occurred while loading your applications. Please try again.'}
        </p>
        <div className="mt-6 flex gap-3">
          <Button onClick={() => reset()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    </DashboardShell>
  )
}
