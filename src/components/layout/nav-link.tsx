'use client'

import Link, { useLinkStatus } from 'next/link'
import type { ComponentProps } from 'react'

/** Underline that fills in while this link's page is loading. */
function PendingBar() {
  const { pending } = useLinkStatus()
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-3 -bottom-px h-0.5 origin-left rounded-full bg-blue-800 transition-[transform,opacity] duration-500 ease-out ${
        pending ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
      }`}
    />
  )
}

/**
 * A navigation link that shows the click registered: the bar fills while the
 * next page loads, then the page's own skeleton takes over.
 */
export function NavLink({ children, className = '', ...props }: ComponentProps<typeof Link>) {
  return (
    <Link {...props} className={`relative ${className}`}>
      {children}
      <PendingBar />
    </Link>
  )
}
