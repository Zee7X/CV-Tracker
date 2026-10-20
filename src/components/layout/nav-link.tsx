'use client'

import Link, { useLinkStatus } from 'next/link'
import type { ComponentProps } from 'react'
import { Loader2 } from 'lucide-react'

/** Shows that the click registered while the next page loads; the page skeleton then takes over. */
function PendingIndicator({ variant }: { variant: 'bar' | 'spinner' }) {
  const { pending } = useLinkStatus()
  if (variant === 'spinner') {
    return pending ? <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin text-stone-400" aria-hidden="true" /> : null
  }
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-3 -bottom-px h-0.5 origin-left rounded-full bg-brand-700 transition-[transform,opacity] duration-500 ease-out ${
        pending ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
      }`}
    />
  )
}

export function NavLink({
  children,
  className = '',
  pendingVariant = 'bar',
  ...props
}: ComponentProps<typeof Link> & { pendingVariant?: 'bar' | 'spinner' }) {
  return (
    <Link {...props} className={`relative ${className}`}>
      {children}
      <PendingIndicator variant={pendingVariant} />
    </Link>
  )
}
