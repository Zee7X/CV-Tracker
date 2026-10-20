import Link from 'next/link'
import { cn } from '@/lib/utils'

/*
 * The mark is a CV sheet whose last line ends in a check: the two halves of the
 * product, writing the CV and following up on where it went.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn('h-8 w-8 shrink-0', className)}>
      <rect width="32" height="32" rx="8" fill="#1d4ed8" />
      <path d="M10 6.5h8.2l4.3 4.3V24a1.5 1.5 0 0 1-1.5 1.5H10A1.5 1.5 0 0 1 8.5 24V8A1.5 1.5 0 0 1 10 6.5Z" fill="#fff" />
      <path d="M18 6.5V11h4.5" fill="none" stroke="#bfdbfe" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M11.5 13.5h6M11.5 16.5h8" stroke="#93c5fd" strokeWidth="1.6" strokeLinecap="round" />
      <path d="m11.6 20.6 1.9 1.9 3.6-3.8" fill="none" stroke="#1d4ed8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Logo({ href = '/', className, tone = 'dark' }: { href?: string; className?: string; tone?: 'dark' | 'light' }) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2',
        className
      )}
    >
      <LogoMark />
      <span className={cn('text-[15px] font-semibold tracking-[-0.01em]', tone === 'light' ? 'text-white' : 'text-stone-950')} data-no-translate>
        CV Tracker
      </span>
    </Link>
  )
}
