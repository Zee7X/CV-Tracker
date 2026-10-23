import { Check } from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { LanguageSwitcher } from '@/components/i18n/language-switcher'
import { ModernTemplate, SAMPLE_CV } from '@/components/cv/templates'

const points = [
  'CV in English or Indonesian, with dates and headings in the right language',
  'Three templates and a PDF that matches the preview',
  'Every application logged with the CV you sent and its stage',
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen p-3 sm:p-5">
      <div className="grid min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/70 shadow-xs backdrop-blur-md sm:min-h-[calc(100vh-2.5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="flex flex-col px-5 py-6 sm:px-10">
          <div className="flex items-center justify-between">
            <Logo />
            <LanguageSwitcher compact />
          </div>
          <div className="flex flex-1 items-center justify-center py-10">
            <div className="w-full max-w-[420px] rounded-3xl border border-slate-200/90 bg-white p-7 shadow-sm sm:p-9">{children}</div>
          </div>
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} CV Tracker</p>
        </div>

        {/* Product panel: a real template rendered with sample data, not a mockup. */}
        <aside className="relative m-3 hidden overflow-hidden rounded-[26px] border border-slate-200/60 lg:flex lg:flex-col" aria-label="About CV Tracker">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(40rem_30rem_at_20%_10%,#bfdbfe_0%,transparent_60%),radial-gradient(36rem_30rem_at_90%_30%,#c7d2fe_0%,transparent_60%),radial-gradient(40rem_30rem_at_60%_100%,#e0e7ff_0%,transparent_60%)] opacity-85"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-white/30 backdrop-blur-xl" />
          <div className="relative z-10 px-12 pt-14 xl:px-16">
            <p className="font-display max-w-md text-[30px] font-medium leading-tight tracking-[-0.025em] text-slate-900">
              Write the CV once. <span className="font-bold text-brand-600">Know which version went where.</span>
            </p>
            <ul className="mt-6 space-y-2.5">
              {points.map((point) => (
                <li key={point} className="flex gap-2.5 text-sm leading-6 text-slate-700">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white shadow-xs">
                    <Check className="h-3 w-3 text-brand-600" strokeWidth={3} aria-hidden="true" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative mt-12 flex-1">
            <div
              className="absolute left-12 top-0 w-[794px] origin-top-left scale-[0.62] overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-slate-200/80 xl:left-16 xl:scale-[0.7]"
              aria-hidden="true"
              data-no-translate
            >
              <ModernTemplate cv={SAMPLE_CV} language="en" />
            </div>
          </div>
          <p className="relative z-10 mx-4 mb-4 rounded-xl border border-slate-200/80 bg-white/90 px-5 py-3 text-xs text-slate-600 shadow-xs">
            Modern template, rendered with sample data.
          </p>
        </aside>
      </div>
    </div>
  )
}
