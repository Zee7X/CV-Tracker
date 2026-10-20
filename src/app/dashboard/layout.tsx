import DashboardShell from '@/components/layout/dashboard-shell'

// The shell lives in the layout so the header stays mounted while pages and
// their loading states swap underneath it.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>
}
