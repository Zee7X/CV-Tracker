import Link from 'next/link'
import { FileText } from 'lucide-react'
import { LanguageSwitcher } from '@/components/i18n/language-switcher'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f3ed] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-stone-950">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-600 text-white">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>CV Tracker</span>
          </Link>
          <LanguageSwitcher compact />
        </div>
        {children}
      </div>
    </div>
  )
}
