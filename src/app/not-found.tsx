import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Logo, LogoGlyph } from '@/components/brand/logo'

export const metadata = {
  title: 'Page not found - CV Tracker',
}

// Any URL that matches no route, including mistyped /dashboard/... links.
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col px-5 py-6 sm:px-10">
      <Logo />
      <main className="flex flex-1 flex-col items-center justify-center py-16 text-center">
        <div className="relative">
          <LogoGlyph className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 text-brand-500 opacity-15" />
          <p className="font-heading text-[clamp(5rem,18vw,9rem)] font-black leading-none text-slate-900" data-no-translate>
            <span className="text-sticker">4</span>
            <span className="text-hollow [--hollow-color:var(--color-brand-500)]">0</span>
            <span className="text-sticker">4</span>
          </p>
        </div>
        <h1 className="font-heading mt-6 text-3xl font-black text-slate-900">
          <span className="ink-label">Page not found</span>
        </h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-slate-600">
          The link may be mistyped, or the page was moved or deleted. Your CVs, letters and applications are unaffected.
        </p>
        <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row">
          <Link
            href="/dashboard"
            className="font-display inline-flex h-12 items-center justify-center rounded-full bg-brand-600 px-7 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Back to overview
          </Link>
          <Link
            href="/"
            className="font-display inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-slate-900 px-6 text-sm font-semibold text-slate-900 transition-colors hover:bg-surface"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Home page
          </Link>
        </div>
      </main>
    </div>
  )
}
