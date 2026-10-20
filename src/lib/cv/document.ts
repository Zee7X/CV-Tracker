import type {
  Certification,
  CVTemplate,
  CVWithRelations,
  DocumentLanguage,
  Education,
  Experience,
  PersonalInfo,
  Project,
} from '@/types/cv'

// Single source of truth for how a CV reads on paper. Both the HTML preview
// templates and the PDF templates render from this, so the preview and the
// downloaded file can never disagree on labels, dates, or ordering.

export const DOCUMENT_LANGUAGES: { id: DocumentLanguage; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'id', label: 'Bahasa Indonesia' },
]

export const CV_LABELS = {
  en: {
    summary: 'Summary',
    experience: 'Experience',
    education: 'Education',
    skills: 'Skills',
    projects: 'Projects',
    certifications: 'Certifications',
    contact: 'Contact',
    present: 'Present',
    email: 'Email',
    phone: 'Phone',
    location: 'Location',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    portfolio: 'Portfolio',
    credential: 'Credential',
    pageOf: (page: number, total: number) => `Page ${page} of ${total}`,
  },
  id: {
    summary: 'Ringkasan',
    experience: 'Pengalaman Kerja',
    education: 'Pendidikan',
    skills: 'Keahlian',
    projects: 'Proyek',
    certifications: 'Sertifikasi',
    contact: 'Kontak',
    present: 'Sekarang',
    email: 'Email',
    phone: 'Telepon',
    location: 'Lokasi',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    portfolio: 'Portofolio',
    credential: 'Kredensial',
    pageOf: (page: number, total: number) => `Halaman ${page} dari ${total}`,
  },
} as const

export type CVLabels = (typeof CV_LABELS)[DocumentLanguage]

const MONTHS: Record<DocumentLanguage, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  id: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
}

export function resolveDocumentLanguage(value: unknown, fallback: DocumentLanguage = 'en'): DocumentLanguage {
  return value === 'en' || value === 'id' ? value : fallback
}

export function getLabels(language: DocumentLanguage): CVLabels {
  return CV_LABELS[language]
}

/** CVs show month and year only: "Jun 2024". A bare year stays a year. */
export function formatMonthYear(value: string | null | undefined, language: DocumentLanguage): string {
  const trimmed = value?.trim()
  if (!trimmed) return ''
  const match = /^(\d{4})(?:-(\d{2}))?/.exec(trimmed)
  if (!match) return trimmed
  const [, year, month] = match
  if (!month) return year
  const index = Number(month) - 1
  return index >= 0 && index < 12 ? `${MONTHS[language][index]} ${year}` : year
}

export function formatDateRange(
  start: string | null | undefined,
  end: string | null | undefined,
  isCurrent: boolean | undefined,
  language: DocumentLanguage
): string {
  const from = formatMonthYear(start, language)
  const to = isCurrent ? CV_LABELS[language].present : formatMonthYear(end, language)
  if (from && to) return from === to ? from : `${from} – ${to}`
  return from || to
}

/** Editor month inputs hold "YYYY-MM"; the database stores a full date. */
export function toMonthValue(value?: string | null): string {
  const match = /^(\d{4}-\d{2})/.exec(value?.trim() || '')
  return match ? match[1] : ''
}

/** "2024-06" -> "2024-06-01" for Postgres date columns; full dates pass through. */
export function toStoredDate(value?: string | null): string | null {
  const trimmed = value?.trim()
  if (!trimmed) return null
  return /^\d{4}-\d{2}$/.test(trimmed) ? `${trimmed}-01` : trimmed
}

export function formatDisplayUrl(url?: string | null): string {
  if (!url) return ''
  return url.trim().replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
}

// ISO dates (YYYY, YYYY-MM, YYYY-MM-DD) compare correctly as strings.
const byDateDesc = (a?: string | null, b?: string | null) => (b || '').localeCompare(a || '')

/** Current roles first, then most recent start date, then most recent end date. */
export function sortExperiences(items: Experience[] = []): Experience[] {
  return [...items].sort((a, b) => {
    if (a.is_current !== b.is_current) return a.is_current ? -1 : 1
    return byDateDesc(a.start_date, b.start_date) || byDateDesc(a.end_date, b.end_date) || a.sort_order - b.sort_order
  })
}

/** Most recently finished first; undated entries keep their manual order at the end. */
export function sortEducations(items: Education[] = []): Education[] {
  return [...items].sort((a, b) => {
    const aKey = a.end_date || a.start_date || ''
    const bKey = b.end_date || b.start_date || ''
    if (!aKey !== !bKey) return aKey ? -1 : 1
    return byDateDesc(aKey, bKey) || a.sort_order - b.sort_order
  })
}

const byManualOrder = <T extends { sort_order: number }>(items: T[] = []) =>
  [...items].sort((a, b) => a.sort_order - b.sort_order)

export type DescriptionBlock = { type: 'paragraph'; text: string } | { type: 'list'; items: string[] }

const BULLET = /^\s*(?:[-*•–·]|\d+[.)])\s+/

/** Lines starting with "-", "*", "•" or "1." become list items; other lines stay paragraphs. */
export function parseDescription(text?: string | null): DescriptionBlock[] {
  if (!text?.trim()) return []
  const blocks: DescriptionBlock[] = []
  for (const raw of text.replace(/\r\n?/g, '\n').split('\n')) {
    const line = raw.trim()
    if (!line) continue
    if (BULLET.test(line)) {
      const item = line.replace(BULLET, '').trim()
      const last = blocks[blocks.length - 1]
      if (last?.type === 'list') last.items.push(item)
      else blocks.push({ type: 'list', items: [item] })
    } else {
      blocks.push({ type: 'paragraph', text: line })
    }
  }
  return blocks
}

export type ContactKey = 'email' | 'phone' | 'location' | 'linkedin' | 'github' | 'portfolio'

export interface ContactItem {
  key: ContactKey
  label: string
  value: string
  href?: string
}

export function buildContactItems(info: Partial<PersonalInfo>, language: DocumentLanguage): ContactItem[] {
  const labels = CV_LABELS[language]
  const items: ContactItem[] = []
  const email = info.email?.trim()
  const phone = info.phone?.trim()
  const location = info.location?.trim()
  if (email) items.push({ key: 'email', label: labels.email, value: email, href: `mailto:${email}` })
  if (phone) items.push({ key: 'phone', label: labels.phone, value: phone, href: `tel:${phone.replace(/[^\d+]/g, '')}` })
  if (location) items.push({ key: 'location', label: labels.location, value: location })
  for (const key of ['linkedin', 'github', 'portfolio'] as const) {
    const url = info[key]?.trim()
    if (url) items.push({ key, label: labels[key], value: formatDisplayUrl(url), href: url })
  }
  return items
}

export type SectionKey = 'summary' | 'skills' | 'experience' | 'projects' | 'education' | 'certifications'

// Experienced-hire order: keywords (skills) near the top for ATS scanners,
// then evidence (experience, projects), then credentials.
export const SECTION_ORDER: SectionKey[] = ['summary', 'skills', 'experience', 'projects', 'education', 'certifications']

export interface CVDocument {
  language: DocumentLanguage
  template: CVTemplate
  labels: CVLabels
  name: string
  title: string
  photoUrl: string | null
  contacts: ContactItem[]
  summary: string
  skills: string[]
  experiences: Experience[]
  educations: Education[]
  projects: Project[]
  certifications: Certification[]
  sections: SectionKey[]
}

export function buildCVDocument(
  cv: CVWithRelations,
  options: { language?: DocumentLanguage; template?: CVTemplate } = {}
): CVDocument {
  const info = cv.personal_info || ({} as PersonalInfo)
  const language = options.language ?? resolveDocumentLanguage(info.document_language)
  const doc: CVDocument = {
    language,
    template: options.template ?? cv.template ?? 'ats',
    labels: CV_LABELS[language],
    name: info.full_name?.trim() || cv.name?.trim() || '',
    title: info.professional_title?.trim() || '',
    photoUrl: info.photo_url || null,
    contacts: buildContactItems(info, language),
    summary: cv.summary?.trim() || '',
    skills: (cv.skills || []).map((skill) => skill.trim()).filter(Boolean),
    experiences: sortExperiences(cv.experiences),
    educations: sortEducations(cv.educations),
    projects: byManualOrder(cv.projects),
    certifications: byManualOrder(cv.certifications),
    sections: [],
  }
  doc.sections = SECTION_ORDER.filter((section) => hasSection(doc, section))
  return doc
}

function hasSection(doc: CVDocument, section: SectionKey): boolean {
  switch (section) {
    case 'summary':
      return Boolean(doc.summary)
    case 'skills':
      return doc.skills.length > 0
    case 'experience':
      return doc.experiences.length > 0
    case 'projects':
      return doc.projects.length > 0
    case 'education':
      return doc.educations.length > 0
    case 'certifications':
      return doc.certifications.length > 0
  }
}

export function educationHeading(edu: Education): string {
  return [edu.degree, edu.field_of_study].filter(Boolean).join(', ')
}
