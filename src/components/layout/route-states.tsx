'use client'

import React, { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export function RouteError({
  what,
  error,
  reset,
}: {
  what: string
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(`Route error (${what}):`, error)
  }, [error, what])

  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-white px-6 py-10">
      <h1 className="text-lg font-semibold text-stone-900">{what}</h1>
      <p className="mt-1 max-w-xl text-sm text-stone-600">
        The server did not respond as expected. Your saved data is not affected. Try again, and if it keeps failing,
        check your connection or sign in again.
      </p>
      {error.digest ? (
        <p className="mt-2 text-xs text-stone-500">
          <span>Reference</span>: <span data-no-translate>{error.digest}</span>
        </p>
      ) : null}
      <Button type="button" onClick={() => reset()} className="mt-5">
        Try again
      </Button>
    </div>
  )
}
