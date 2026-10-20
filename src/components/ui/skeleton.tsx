import React from 'react'
import { cn } from '@/lib/utils'

/*
 * Building blocks for loading states. A skeleton reuses the real component's
 * markup and static text (titles, labels, buttons) and only swaps the data for
 * bones, so the page does not shift when the data arrives.
 */

/** A grey placeholder bar. */
export function Bone({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn('skeleton-bone block rounded', className)} />
}

// Line box and bar height per Tailwind text size, so a bone takes exactly the
// vertical space of one line of that text.
const LINE = {
  xs: ['h-4', 'h-2.5'],
  sm: ['h-5', 'h-3'],
  base: ['h-6', 'h-3.5'],
  lg: ['h-7', 'h-4'],
  xl: ['h-7', 'h-4'],
  '2xl': ['h-8', 'h-5'],
} as const

/**
 * One line of text that has not loaded yet. `className` sizes the bar (width);
 * `boxClassName` goes on the line box (margins), matching the real element.
 */
export function TextBone({
  size = 'sm',
  className,
  boxClassName,
}: {
  size?: keyof typeof LINE
  className?: string
  boxClassName?: string
}) {
  const [box, bar] = LINE[size]
  return (
    <span aria-hidden="true" className={cn('flex items-center', box, boxClassName)}>
      <span className={cn('skeleton-bone block rounded', bar, className ?? 'w-32')} />
    </span>
  )
}

const fieldBox = 'block w-full rounded-md border border-stone-300 bg-[#fffefa]'

/** An input or select whose value is still loading: same box, a bone for the value. */
export function InputBone({ className, empty = false }: { className?: string; empty?: boolean }) {
  return (
    <span aria-hidden="true" className={cn(fieldBox, 'relative h-10', className)}>
      {empty ? null : <span className="skeleton-bone absolute left-3 top-1/2 block h-3 w-2/5 -translate-y-1/2 rounded" />}
    </span>
  )
}

/** A textarea placeholder. Height follows the real textarea's rows (text-sm, leading-relaxed, py-2). */
export function TextareaBone({ rows, empty = false }: { rows: number; empty?: boolean }) {
  return (
    <span aria-hidden="true" className={cn(fieldBox, 'space-y-2.5 px-3 py-3')} style={{ height: rows * 22.75 + 18 }}>
      {empty
        ? null
        : Array.from({ length: Math.min(rows - 1, 3) }, (_, i) => (
            <span key={i} className={cn('skeleton-bone block h-2.5 rounded', i === 2 ? 'w-3/5' : 'w-11/12')} />
          ))}
    </span>
  )
}

/**
 * Wraps a whole loading page. Screen readers hear "Loading" once; bones are
 * hidden from them, while real static text (titles, labels) stays readable.
 */
export function SkeletonRegion({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div aria-busy="true" className={cn('skeleton-page', className)}>
      <span role="status" className="sr-only">
        Loading
      </span>
      {children}
    </div>
  )
}
