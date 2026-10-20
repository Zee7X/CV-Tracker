'use client'

import { RouteError } from '@/components/layout/route-states'

export default function Error(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError what="Could not load your account" {...props} />
}
