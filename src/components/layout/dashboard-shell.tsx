'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Bell, BriefcaseBusiness, FileText, LayoutDashboard, LogOut, Mail, Menu, Plus, Search, Settings, X, type LucideIcon } from 'lucide-react'
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
    <nav aria-label="Main" className="space-y-1">
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
                ? 'bg-brand-600 font-semibold text-white shadow-xs'
                : 'font-medium text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
            }`}
          >
            <Icon
              className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`}
              strokeWidth={active ? 2.2 : 1.8}
              aria-hidden="true"
            />
            <span className="flex-1">{item.name}</span>
            {value !== null && value !== undefined ? (
              <span
                className={`min-w-6 rounded-full px-2 py-0.5 text-center text-xs tabular-nums ${
                  active ? 'bg-white/20 text-white font-medium' : 'bg-slate-100 text-slate-600'
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
    <div className="space-y-2">
      <NavLink
        href="/dashboard/account"
        aria-current={accountActive ? 'page' : undefined}
        pendingVariant="spinner"
        className={`font-display group flex h-10 items-center gap-3 rounded-full px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${
          accountActive ? 'bg-brand-600 font-semibold text-white shadow-xs' : 'font-medium text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
        }`}
      >
        <Settings
          className={`h-4 w-4 shrink-0 ${accountActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`}
          strokeWidth={accountActive ? 2.2 : 1.8}
          aria-hidden="true"
        />
        <span className="flex-1">Settings</span>
      </NavLink>
      <div className="flex items-center justify-between border-t border-slate-200/70 pt-2 px-1">
        <NavLink
          href="/dashboard/account"
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-full p-1 transition-colors hover:bg-slate-100/70"
        >
          {user ? <Avatar user={user} /> : null}
          <span className="min-w-0 flex-1 text-left">
            <span className="block truncate text-xs font-semibold text-slate-900" data-no-translate>
              {user?.name || 'Account'}
            </span>
            <span className="block truncate text-[11px] text-slate-500" data-no-translate>
              {user?.email}
            </span>
          </span>
        </NavLink>
        <form action="/dashboard/logout" method="POST">
          <button
            type="submit"
            aria-label="Sign out"
            title="Sign out"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      </div>
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
    <div className="min-h-screen text-slate-900">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-3 left-3 z-40 hidden w-64 flex-col rounded-[28px] border border-slate-200/80 bg-white/90 shadow-xs backdrop-blur-md lg:flex print:hidden">
        <div className="flex h-20 items-center px-6">
          <Logo href="/dashboard" />
        </div>
        <div className="px-4 pb-4">
          <ButtonLink href="/dashboard/applications/new" className="w-full">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add application
          </ButtonLink>
        </div>
        <div className="flex-1 overflow-y-auto px-4">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Workspace</p>
          <SidebarNav pathname={pathname} counts={counts} />
        </div>
        <div className="space-y-3 border-t border-slate-200/70 p-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-medium text-slate-500">Language</span>
            <LanguageSwitcher compact />
          </div>
          <UserBlock user={user} pathname={pathname} />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md lg:hidden print:hidden">
        <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
          <Logo href="/dashboard" className="mr-auto" />
          <LanguageSwitcher compact />
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
        <div id="mobile-nav" data-open={isMobileMenuOpen} inert={!isMobileMenuOpen} className="collapse-panel">
          <div className={isMobileMenuOpen ? 'border-t border-slate-200/70' : ''}>
            <div className="space-y-3 px-3 py-3 sm:px-5">
              <SidebarNav pathname={pathname} counts={counts} />
              <div className="border-t border-slate-200/70 pt-3">
                <UserBlock user={user} pathname={pathname} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main id="main" className="lg:pl-[17.5rem]">
        {/* Desktop Top Header Bar matching EduMate */}
        <header className="sticky top-0 z-30 hidden h-16 items-center justify-between border-b border-slate-200/70 bg-white/70 px-8 backdrop-blur-md lg:flex print:hidden">
          <form action="/dashboard/applications" method="GET" className="relative w-80">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              name="search"
              placeholder="Search..."
              className="h-10 w-full rounded-full border border-slate-200 bg-white pl-9 pr-4 text-xs font-medium text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </form>
          <div className="flex items-center gap-3">
            <NavLink
              href="/dashboard/applications"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-xs transition-colors hover:bg-slate-50 hover:text-slate-900"
              title="Applications"
            >
              <Bell className="h-4 w-4" aria-hidden="true" />
              {(counts.applications ?? 0) > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold text-white">
                  {counts.applications}
                </span>
              ) : null}
            </NavLink>
            {user ? (
              <NavLink
                href="/dashboard/account"
                className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white py-1 pl-1.5 pr-4 shadow-xs transition-colors hover:bg-slate-50"
              >
                <Avatar user={user} />
                <div className="text-left leading-tight">
                  <span className="block max-w-[130px] truncate text-xs font-semibold text-slate-900" data-no-translate>
                    {user.name || 'Account'}
                  </span>
                  <span className="block max-w-[130px] truncate text-[11px] text-slate-500" data-no-translate>
                    {user.email}
                  </span>
                </div>
              </NavLink>
            ) : null}
          </div>
        </header>

        {/* Keyed on the path so each page mounts fresh and settles in (see .route-content); the sidebar stays put. */}
        <div key={pathname} className="route-content mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
