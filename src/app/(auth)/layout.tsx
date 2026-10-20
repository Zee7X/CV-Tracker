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
      <div className="glass-soft grid min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-[32px] border sm:min-h-[calc(100vh-2.5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="flex flex-col px-5 py-6 sm:px-10">
          <div className="flex items-center justify-between">
            <Logo />
            <LanguageSwitcher compact />
          </div>
          <div className="flex flex-1 items-center justify-center py-10">
            <div className="glass w-full max-w-[420px] rounded-[28px] p-7 sm:p-9">{children}</div>
          </div>
          <p className="text-xs text-stone-500">© {new Date().getFullYear()} CV Tracker</p>
        </div>

        {/* Product panel: a real template rendered with sample data, not a mockup. */}
        <aside className="relative m-3 hidden overflow-hidden rounded-[26px] lg:flex lg:flex-col" aria-label="About CV Tracker">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(40rem_30rem_at_20%_10%,#ffb08f_0%,transparent_60%),radial-gradient(36rem_30rem_at_90%_30%,#f7a8d0_0%,transparent_60%),radial-gradient(40rem_30rem_at_60%_100%,#c7b4ff_0%,transparent_60%)] opacity-90"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-white/20 backdrop-blur-2xl" />
          <div className="relative z-10 px-12 pt-14 xl:px-16">
            <p className="font-display max-w-md text-[30px] font-medium leading-tight tracking-[-0.025em] text-stone-900">
              Write the CV once. <span className="font-semibold">Know which version went to which company.</span>
            </p>
            <ul className="mt-6 space-y-2.5">
              {points.map((point) => (
                <li key={point} className="flex gap-2.5 text-sm leading-6 text-stone-800">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/70">
                    <Check className="h-3 w-3 text-brand-600" strokeWidth={3} aria-hidden="true" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative mt-12 flex-1">
            <div
              className="absolute left-12 top-0 w-[794px] origin-top-left scale-[0.62] overflow-hidden rounded-xl bg-white shadow-[0_40px_80px_-30px_rgba(120,40,80,0.55)] ring-1 ring-white xl:left-16 xl:scale-[0.7]"
              aria-hidden="true"
              data-no-translate
            >
              <ModernTemplate cv={SAMPLE_CV} language="en" />
            </div>
          </div>
          <p className="glass relative z-10 mx-4 mb-4 rounded-2xl bg-white/85 px-5 py-3 text-xs text-stone-600">
            Modern template, rendered with sample data.
          </p>
        </aside>
      </div>
    </div>
  )
}
