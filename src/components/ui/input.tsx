import * as React from 'react'
import { cn } from '@/lib/utils'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-xl border border-white/80 bg-white/70 px-3.5 py-2 text-sm text-stone-900 shadow-[inset_0_1px_2px_rgba(120,60,80,0.06)] transition-colors placeholder:text-stone-400 hover:bg-white/85 focus-visible:border-brand-400 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'
