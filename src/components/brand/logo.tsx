import Link from 'next/link'
import { cn } from '@/lib/utils'

/* The mark is a glowing orb with a small check: the follow-up half of the product. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn('orb relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full', className)}>
      <svg viewBox="0 0 16 16" className="h-[45%] w-[45%]" fill="none">
        <path d="m3.5 8.4 2.9 2.9 6-6.3" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
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
        className={cn('font-display text-[17px] font-semibold tracking-[-0.02em]', tone === 'light' ? 'text-white' : 'text-stone-900')}
        data-no-translate
      >
        CV Tracker
      </span>
    </Link>
  )
}
