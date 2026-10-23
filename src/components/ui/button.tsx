import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'font-display inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-brand-600 text-white shadow-xs hover:bg-brand-700 active:bg-brand-800',
        secondary:
          'bg-slate-100 text-slate-800 hover:bg-slate-200/80',
        outline:
          'border border-slate-200/90 bg-white text-slate-800 shadow-xs hover:bg-slate-50 hover:text-slate-900',
        ghost:
          'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900',
        dangerOutline:
          'border border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300',
        brandOutline:
          'border border-brand-200 bg-white text-brand-700 hover:bg-brand-50 hover:border-brand-300',
        link: 'h-auto p-0 text-brand-700 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-9 px-3.5 text-xs',
        lg: 'h-12 px-6 text-base font-medium',
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
