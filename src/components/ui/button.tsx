import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border border-blue-700 bg-blue-700 text-white shadow-[0_1px_2px_rgba(29,78,216,0.25)] hover:border-blue-800 hover:bg-blue-800 active:bg-blue-900',
        secondary:
          'bg-stone-200 text-stone-950 hover:bg-stone-300',
        outline:
          'border border-stone-300 bg-white text-stone-900 shadow-[0_1px_1px_rgba(28,25,23,0.04)] hover:border-stone-400 hover:bg-stone-50',
        ghost:
          'text-stone-700 hover:bg-stone-200/70 hover:text-stone-950',
        link: 'h-auto p-0 text-blue-800 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3 text-xs',
        lg: 'h-12 rounded-lg px-6 text-base font-semibold',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { buttonVariants }
export default Button
