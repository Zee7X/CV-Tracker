import { cn } from '@/lib/utils'

// Muted tints so a list of companies is easy to scan without turning into a rainbow.
const TINTS = [
  'bg-blue-50 text-blue-800 ring-blue-100',
  'bg-amber-50 text-amber-800 ring-amber-100',
  'bg-emerald-50 text-emerald-800 ring-emerald-100',
  'bg-rose-50 text-rose-800 ring-rose-100',
  'bg-violet-50 text-violet-800 ring-violet-100',
  'bg-stone-100 text-stone-700 ring-stone-200',
]

function hash(value: string) {
  let h = 0
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function initialsOf(value: string) {
  return (
    value
      .replace(/^(pt|cv|tbk)\.?\s+/i, '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || '?'
  )
}

/** Initials of a company or person on a tint picked from the name, so the same company always looks the same. */
export function Monogram({ name, className, size = 'md' }: { name: string; className?: string; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span
      aria-hidden="true"
      data-no-translate
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-md font-semibold ring-1 ring-inset',
        size === 'sm' && 'h-8 w-8 text-[11px]',
        size === 'md' && 'h-10 w-10 text-xs',
        size === 'lg' && 'h-12 w-12 text-sm',
        TINTS[hash(name.toLowerCase()) % TINTS.length],
        className
      )}
    >
      {initialsOf(name)}
    </span>
  )
}
