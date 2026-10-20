import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'font-display inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-[0_8px_20px_-8px_rgba(204,66,25,0.7),inset_0_1px_0_rgba(255,255,255,0.25)] hover:from-brand-600 hover:to-brand-700',
        secondary:
          'bg-white/60 text-stone-900 hover:bg-white/80',
        outline:
          'border border-white/80 bg-white/60 text-stone-900 shadow-[0_4px_14px_-6px_rgba(120,60,80,0.2)] backdrop-blur-md hover:bg-white/85',
        ghost:
          'text-stone-700 hover:bg-white/60 hover:text-stone-900',
        link: 'h-auto p-0 text-brand-800 underline-offset-4 hover:underline',
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
