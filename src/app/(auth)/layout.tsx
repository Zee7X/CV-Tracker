import { Check } from 'lucide-react'
import { Logo, LogoGlyph } from '@/components/brand/logo'
import { LanguageSwitcher } from '@/components/i18n/language-switcher'
import { ThemeToggleButton } from '@/components/theme/theme-toggle'
import { ModernTemplate, SAMPLE_CV } from '@/components/cv/templates'

const points = [
  'CV in English or Indonesian, with dates and headings in the right language',
  'Three templates and a PDF that matches the preview',
  'Every application logged with the CV you sent and its stage',
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="flex flex-col px-5 py-6 sm:px-10">
          <div className="flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-1">
              <LanguageSwitcher compact />
              <ThemeToggleButton />
            </div>
          </div>
          <div className="flex flex-1 items-center justify-center py-10">
            <div className="w-full max-w-[420px] rounded-[28px] border border-slate-200/90 bg-surface p-7 shadow-[0_20px_50px_-30px_rgba(24,24,27,0.35)] sm:p-9">{children}</div>
          </div>
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} CV Tracker</p>
        </div>

        {/* Product panel: ink, like the landing page nav. `dark` flips the slate text inside to light. */}
        <aside className="dark sticky top-0 hidden h-screen overflow-hidden bg-ink lg:flex lg:flex-col" aria-label="About CV Tracker">
          <LogoGlyph className="pointer-events-none absolute -right-16 -top-16 h-96 w-96 rotate-12 text-brand-400 opacity-[0.14]" />
          <div className="relative z-10 px-12 pt-14 xl:px-16">
            <p className="font-heading max-w-lg text-[40px] font-black leading-[1.08] text-white xl:text-[46px]">
              <span>Write the CV once. </span>
              <span className="text-brand-400">Know which version </span>
              <span className="tag-label">went where.</span>
            </p>
            <ul className="mt-8 space-y-3">
              {points.map((point) => (
                <li key={point} className="flex gap-3 text-sm leading-6 text-white/75">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blush">
                    <Check className="h-3 w-3 text-ink" strokeWidth={3} aria-hidden="true" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative mt-12 flex-1">
            <div
              className="paper absolute left-14 top-2 w-[794px] origin-top-left rotate-[-4deg] scale-[0.6] overflow-hidden rounded-2xl bg-surface shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)] xl:left-20 xl:scale-[0.66]"
              aria-hidden="true"
              data-no-translate
            >
              <ModernTemplate cv={SAMPLE_CV} language="en" />
            </div>
          </div>
          <p className="relative z-10 mx-4 mb-4 w-fit rounded-full bg-blush px-5 py-2.5 text-xs font-semibold text-ink shadow-xs">
            Modern template, rendered with sample data.
          </p>
        </aside>
      </div>
    </div>
  )
}
