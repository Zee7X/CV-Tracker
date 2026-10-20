'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { NavLink } from '@/components/layout/nav-link'
import { LanguageSwitcher } from '@/components/i18n/language-switcher'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
  { name: 'Overview', href: '/dashboard' },
  { name: 'Applications', href: '/dashboard/applications' },
  { name: 'CVs', href: '/dashboard/cv' },
  { name: 'Cover letters', href: '/dashboard/cover-letters' },
]

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`))
}

export function Wordmark({ href = '/dashboard' }: { href?: string }) {
  return (
    <Link
      href={href}
      className="rounded text-base font-semibold text-stone-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800 focus-visible:ring-offset-2"
    >
      CV Tracker
    </Link>
  )
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [menuPath, setMenuPath] = useState(pathname)
  if (menuPath !== pathname) {
    setMenuPath(pathname)
    setIsMobileMenuOpen(false)
  }

  const linkClass = (active: boolean, mobile: boolean) =>
    `rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800 ${
      mobile ? 'block px-3 py-2.5' : 'px-3 py-2'
    } ${active ? 'bg-stone-200/70 text-stone-950' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-950'}`

  const accountActive = pathname.startsWith('/dashboard/account')

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f3ed] text-stone-950">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 w-full border-b border-stone-300 bg-[#fffefa] print:hidden">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Wordmark />

          <nav aria-label="Main" className="hidden flex-1 items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href)
              return (
                <NavLink key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={linkClass(active, false)}>
                  {item.name}
                </NavLink>
              )
            })}
          </nav>

          <div className="ml-auto hidden items-center gap-1 md:flex">
            <LanguageSwitcher compact />
            <NavLink href="/dashboard/account" aria-current={accountActive ? 'page' : undefined} className={linkClass(accountActive, false)}>
              Account
            </NavLink>
            <form action="/dashboard/logout" method="POST">
              <Button type="submit" variant="ghost" size="sm">
                Sign out
              </Button>
            </form>
          </div>

          <button
            type="button"
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-md text-stone-700 hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800 md:hidden"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>

        <div id="mobile-nav" data-open={isMobileMenuOpen} inert={!isMobileMenuOpen} className="collapse-panel bg-[#fffefa] md:hidden">
          <div className={isMobileMenuOpen ? 'border-t border-stone-300' : ''}>
            <nav aria-label="Main" className="mx-auto max-w-6xl space-y-1 px-4 py-3 sm:px-6">
              {[...NAV_ITEMS, { name: 'Account', href: '/dashboard/account' }].map((item) => {
                const active = isActive(pathname, item.href)
                return (
                  <NavLink key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={linkClass(active, true)}>
                    {item.name}
                  </NavLink>
                )
              })}
              <div className="flex items-center justify-between gap-3 border-t border-stone-200 px-3 pt-3">
                <LanguageSwitcher />
                <form action="/dashboard/logout" method="POST">
                  <Button type="submit" variant="outline" size="sm">
                    Sign out
                  </Button>
                </form>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main id="main" className="flex-1">
        {/* Keyed on the path so each page mounts fresh and settles in (see .route-content); the header stays put. */}
        <div key={pathname} className="route-content mx-auto max-w-6xl px-4 py-8 sm:px-6">
          {children}
        </div>
      </main>
    </div>
  )
}
