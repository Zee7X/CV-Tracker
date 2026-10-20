import Link from 'next/link'
import { LanguageSwitcher } from '@/components/i18n/language-switcher'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f3ed] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="text-base font-semibold text-stone-950">
            CV Tracker
          </Link>
          <LanguageSwitcher compact />
        </div>
        {children}
      </div>
    </div>
  )
}
