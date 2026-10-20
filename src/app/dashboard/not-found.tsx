import { EmptyState } from '@/components/layout/page-header'
import { ButtonLink } from '@/components/ui/button-link'

export default function DashboardNotFound() {
  return (
    <EmptyState
      title="This item no longer exists"
      description="It may have been deleted, or the link is wrong. Your other CVs, letters and applications are unaffected."
      action={<ButtonLink href="/dashboard">Back to overview</ButtonLink>}
    />
  )
}
