/** Short, unambiguous date for lists: "19 Oct 2026" / "19 Okt 2026". */
export function formatShortDate(value: string | null | undefined, language: 'en' | 'id' = 'en'): string {
  if (!value) return ''
  // Plain YYYY-MM-DD dates are calendar days; parse them as local dates so they do not shift by time zone.
  const plain = /^\d{4}-\d{2}-\d{2}$/.test(value)
  const date = plain ? new Date(`${value}T00:00:00`) : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const TEMPLATE_NAMES: Record<string, string> = {
  ats: 'ATS Clean',
  professional: 'Professional',
  modern: 'Modern',
}
