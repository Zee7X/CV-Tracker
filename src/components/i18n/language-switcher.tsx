'use client'

import { Languages } from 'lucide-react'
import { useLanguage, type Language } from './language-provider'

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useLanguage()

  return (
    <div
      className="inline-flex h-9 items-center gap-0.5 rounded-full border border-stone-300 bg-white p-1 text-xs font-semibold text-stone-600"
      aria-label={language === 'id' ? 'Pilih bahasa' : 'Choose language'}
    >
      {!compact && <Languages className="ml-1.5 h-3.5 w-3.5 text-stone-500" aria-hidden="true" />}
      {(['id', 'en'] as Language[]).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLanguage(option)}
          aria-pressed={language === option}
          className={`min-w-8 rounded-full px-2 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-1 ${
            language === option
              ? 'bg-blue-700 text-white'
              : 'hover:bg-stone-100 hover:text-stone-950'
          }`}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
