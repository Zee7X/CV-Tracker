'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Briefcase, FileText, LayoutDashboard, LogOut, Mail, Menu, User, X } from 'lucide-react'
import { LanguageSwitcher } from '@/components/i18n/language-switcher'
import { Button } from '@/components/ui/button'

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'CV', href: '/dashboard/cv', icon: FileText },
    { name: 'Cover Letters', href: '/dashboard/cover-letters', icon: Mail },
    { name: 'Applications', href: '/dashboard/applications', icon: Briefcase },
    { name: 'Account', href: '/dashboard/account', icon: User },
  ]

  const navigation = (mobile = false) => (
    <nav className={mobile ? 'flex flex-col gap-1' : 'hidden items-center gap-1 md:flex'}>
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== '/dashboard' && pathname.startsWith(item.href))
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => mobile && setIsMobileMenuOpen(false)}
            className={`flex items-center rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800 focus-visible:ring-offset-2 ${
              mobile ? 'gap-3 px-3 py-2.5' : 'gap-2 px-3 py-2'
            } ${isActive ? 'bg-blue-100 text-blue-950' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-950'}`}
          >
            <item.icon className={mobile ? 'h-5 w-5' : 'h-4 w-4'} aria-hidden="true" />
            {item.name}
          </Link>
        )
      })}
      {!mobile && <LanguageSwitcher compact />}
      {mobile && <div className="px-3 py-2"><LanguageSwitcher /></div>}
      <form action="/dashboard/logout" method="POST">
        <Button type="submit" variant="ghost" size={mobile ? 'default' : 'sm'} className={mobile ? 'w-full justify-start' : 'ml-1'}>
          <LogOut className={mobile ? 'h-5 w-5' : 'h-4 w-4'} aria-hidden="true" />
          <span>Logout</span>
        </Button>
      </form>
    </nav>
  )

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f3ed] text-stone-950">
      <header className="sticky top-0 z-40 w-full border-b border-stone-300 bg-[#fffefa]/95 backdrop-blur print:hidden">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-lg font-bold tracking-tight text-stone-950">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-600 text-white">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="hidden sm:inline">CV Tracker</span>
          </Link>

          {navigation()}

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-md text-stone-600 hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800 md:hidden"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-stone-300 bg-[#fffefa] md:hidden">
            <div className="container mx-auto max-w-6xl px-4 py-3 sm:px-6">{navigation(true)}</div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <div className="container mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
      </main>

      <footer className="border-t border-stone-300 bg-[#fffefa] py-6 text-sm text-stone-500">
        <div className="container mx-auto max-w-6xl px-4 text-center sm:px-6">
          © {new Date().getFullYear()} CV Tracker
        </div>
      </footer>
    </div>
  )
}
