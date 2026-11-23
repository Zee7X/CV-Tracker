import Link from 'next/link'
import { cn } from '@/lib/utils'

/*
 * The mark: "CV" on a violet tile, with a progress bar under it for the
 * tracking half of the product. Same drawing as src/app/icon.svg (the favicon);
 * favicon.ico and apple-icon.png are rendered from that file.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className={cn('h-8 w-8 shrink-0', className)}>
      <rect width="32" height="32" rx="9" fill="var(--color-brand-600)" />
      <path d="M14.2 11.6a5.2 5.2 0 1 0 0 7.6" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" />
      <path d="m17 10.8 3.2 8.6 3.4-8.6" fill="none" stroke="var(--color-blush)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="7" y="24" width="18" height="2.6" rx="1.3" fill="#fff" fillOpacity="0.28" />
      <rect x="7" y="24" width="12" height="2.6" rx="1.3" fill="#fff" />
    </svg>
  )
}

/** The C and V strokes alone, in currentColor: for large faint background decoration. */
export function LogoGlyph({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="6 8 20 20" className={cn('shrink-0', className)}>
      <g fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.2 11.6a5.2 5.2 0 1 0 0 7.6" />
        <path d="m17 10.8 3.2 8.6 3.4-8.6" />
      </g>
      <rect x="7" y="24" width="12" height="2.6" rx="1.3" fill="currentColor" />
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
