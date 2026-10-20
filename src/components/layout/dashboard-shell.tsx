'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { BriefcaseBusiness, FileText, LayoutDashboard, LogOut, Mail, Menu, Plus, X, type LucideIcon } from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { NavLink } from '@/components/layout/nav-link'
import { LanguageSwitcher } from '@/components/i18n/language-switcher'
import { ButtonLink } from '@/components/ui/button-link'
import { initialsOf } from '@/components/ui/monogram'

export interface ShellUser {
  name: string
  email: string
  avatarUrl: string | null
}

export interface ShellCounts {
  applications: number | null
  cvs: number | null
  letters: number | null
}

const NAV_ITEMS: { name: string; href: string; icon: LucideIcon; count?: keyof ShellCounts }[] = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Applications', href: '/dashboard/applications', icon: BriefcaseBusiness, count: 'applications' },
  { name: 'CVs', href: '/dashboard/cv', icon: FileText, count: 'cvs' },
  { name: 'Cover letters', href: '/dashboard/cover-letters', icon: Mail, count: 'letters' },
]

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`))
}

function Avatar({ user }: { user: ShellUser }) {
  if (user.avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={user.avatarUrl} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-stone-200" />
  }
  return (
    <span
      aria-hidden="true"
      className="orb flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
      data-no-translate
    >
      {initialsOf(user.name || user.email)}
    </span>
  )
}

function SidebarNav({ pathname, counts }: { pathname: string; counts: ShellCounts }) {
  return (
    <nav aria-label="Main" className="space-y-0.5">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href)
        const value = item.count ? counts[item.count] : null
        const Icon = item.icon
        return (
          <NavLink
            key={item.href}
            href={item.href}
            pendingVariant="spinner"
            aria-current={active ? 'page' : undefined}
            className={`font-display group flex h-11 items-center gap-3 rounded-full px-4 text-sm transition-[background-color,color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${
              active
                ? 'bg-white/90 font-semibold text-stone-900 shadow-[0_6px_18px_-8px_rgba(120,60,80,0.35)]'
                : 'font-medium text-stone-600 hover:bg-white/50 hover:text-stone-900'
            }`}
          >
            <Icon
              className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-brand-500' : 'text-stone-500 group-hover:text-stone-700'}`}
              strokeWidth={active ? 2.2 : 1.8}
              aria-hidden="true"
            />
            <span className="flex-1">{item.name}</span>
            {value !== null && value !== undefined ? (
              <span
                className={`min-w-6 rounded-full px-2 py-0.5 text-center text-xs tabular-nums ${
                  active ? 'bg-brand-50 text-brand-700' : 'bg-white/50 text-stone-500'
                }`}
              >
                {value}
              </span>
            ) : null}
          </NavLink>
        )
      })}
    </nav>
  )
}

function UserBlock({ user, pathname }: { user: ShellUser | null; pathname: string }) {
  const accountActive = pathname.startsWith('/dashboard/account')
  return (
    <div className="flex items-center gap-1">
      <NavLink
        href="/dashboard/account"
        aria-current={accountActive ? 'page' : undefined}
        pendingVariant="spinner"
        className={`flex min-w-0 flex-1 items-center gap-3 rounded-full py-1.5 pl-1.5 pr-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${
          accountActive ? 'bg-white/90 shadow-[0_6px_18px_-8px_rgba(120,60,80,0.35)]' : 'hover:bg-white/50'
        }`}
      >
        {user ? <Avatar user={user} /> : null}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-stone-900" data-no-translate>
            {user?.name || 'Account'}
          </span>
          <span className="block truncate text-xs text-stone-500" data-no-translate>
            {user?.email}
          </span>
        </span>
      </NavLink>
      <form action="/dashboard/logout" method="POST">
        <button
          type="submit"
          aria-label="Sign out"
          title="Sign out"
          className="flex h-9 w-9 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-white/70 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  )
}

export default function DashboardShell({
  children,
  user,
  counts,
}: {
  children: React.ReactNode
  user: ShellUser | null
  counts: ShellCounts
}) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [menuPath, setMenuPath] = useState(pathname)
  if (menuPath !== pathname) {
    setMenuPath(pathname)
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen text-stone-900">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="glass-soft fixed inset-y-3 left-3 z-40 hidden w-64 flex-col rounded-[28px] border lg:flex print:hidden">
        <div className="flex h-20 items-center px-6">
          <Logo href="/dashboard" />
        </div>
        <div className="px-4 pb-5">
          <ButtonLink href="/dashboard/applications/new" className="w-full">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add application
          </ButtonLink>
        </div>
        <div className="flex-1 overflow-y-auto px-4">
          <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-stone-500">Workspace</p>
          <SidebarNav pathname={pathname} counts={counts} />
        </div>
        <div className="space-y-3 border-t border-stone-900/[0.06] p-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-medium text-stone-500">Language</span>
            <LanguageSwitcher compact />
          </div>
          <UserBlock user={user} pathname={pathname} />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="glass-soft sticky top-0 z-40 border-b lg:hidden print:hidden">
        <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
          <Logo href="/dashboard" className="mr-auto" />
          <LanguageSwitcher compact />
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-stone-700 hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
        <div id="mobile-nav" data-open={isMobileMenuOpen} inert={!isMobileMenuOpen} className="collapse-panel">
          <div className={isMobileMenuOpen ? 'border-t border-stone-900/[0.06]' : ''}>
            <div className="space-y-3 px-3 py-3 sm:px-5">
              <SidebarNav pathname={pathname} counts={counts} />
              <div className="border-t border-stone-900/[0.06] pt-3">
                <UserBlock user={user} pathname={pathname} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main id="main" className="lg:pl-[17.5rem]">
        {/* Keyed on the path so each page mounts fresh and settles in (see .route-content); the sidebar stays put. */}
        <div key={pathname} className="route-content mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
