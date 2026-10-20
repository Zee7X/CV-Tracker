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
    <div className="grid min-h-screen bg-white lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo />
          <LanguageSwitcher compact />
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
        <p className="text-xs text-stone-400">© {new Date().getFullYear()} CV Tracker</p>
      </div>

      {/* Product panel: a real template rendered with sample data, not a mockup. */}
      <aside className="relative hidden overflow-hidden bg-[#1c2b4a] lg:flex lg:flex-col" aria-label="About CV Tracker">
        <div className="relative z-10 px-12 pt-14 xl:px-16">
          <p className="max-w-md text-[28px] font-semibold leading-tight tracking-[-0.02em] text-white">
            Write the CV once. Know which version went to which company.
          </p>
          <ul className="mt-6 space-y-2.5">
            {points.map((point) => (
              <li key={point} className="flex gap-2.5 text-sm leading-6 text-blue-100/85">
                <Check className="mt-1 h-4 w-4 shrink-0 text-blue-300" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative mt-12 flex-1">
          <div
            className="absolute left-12 top-0 w-[794px] origin-top-left scale-[0.62] overflow-hidden rounded-md bg-white shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)] xl:left-16 xl:scale-[0.7]"
            aria-hidden="true"
            data-no-translate
          >
            <ModernTemplate cv={SAMPLE_CV} language="en" />
          </div>
        </div>
        <p className="relative z-10 border-t border-white/10 bg-[#1c2b4a] px-12 py-4 text-xs text-blue-100/60 xl:px-16">
          Modern template, rendered with sample data.
        </p>
      </aside>
    </div>
  )
}
