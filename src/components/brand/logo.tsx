import Link from 'next/link'
import { cn } from '@/lib/utils'

const PETALS = [0, 45, 90, 135, 180, 225, 270, 315]

/*
 * The mark: a violet flower (the fresh start of a new CV) with an ink centre
 * holding a check (the application you followed up). Same drawing as
 * src/app/icon.svg, which is the favicon.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className={cn('h-8 w-8 shrink-0', className)}>
      <g fill="var(--color-brand-500)">
        {PETALS.map((angle) => (
          <ellipse key={angle} cx="16" cy="7.6" rx="4.3" ry="7.1" transform={`rotate(${angle} 16 16)`} />
        ))}
      </g>
      <circle cx="16" cy="16" r="6.4" fill="var(--color-ink)" />
      <path d="m13 16.2 2.1 2.1 4-4.2" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Logo({ href = '/', className, tone = 'dark' }: { href?: string; className?: string; tone?: 'dark' | 'light' }) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2',
        className
      )}
    >
      <LogoMark />
      <span
        className={cn('font-heading text-[19px] font-bold', tone === 'light' ? 'text-white' : 'text-slate-900')}
        data-no-translate
      >
        CV Tracker
      </span>
    </Link>
  )
}
