import * as React from 'react'
import Link from 'next/link'
import type { VariantProps } from 'class-variance-authority'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// A link that looks like a button. Wrapping <Button> in <Link> nests a button
// inside an anchor, which is invalid HTML and creates two tab stops.
type ButtonLinkProps = React.ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>

export function ButtonLink({ className, variant, size, ...props }: ButtonLinkProps) {
  return <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
