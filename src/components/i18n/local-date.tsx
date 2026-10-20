'use client'

import { useLanguage } from '@/components/i18n/language-provider'
import { formatShortDate } from '@/lib/format'

/** A date in the UI language: "19 Oct 2026" or "19 Okt 2026". */
export function LocalDate({ value }: { value: string | null | undefined }) {
  const { language } = useLanguage()
  const text = formatShortDate(value, language)
  if (!text) return null
  return (
    <time dateTime={value ?? undefined} data-no-translate>
      {text}
    </time>
  )
}
