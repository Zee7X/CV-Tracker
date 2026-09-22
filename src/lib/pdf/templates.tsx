import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  Link,
  Image,
  StyleSheet,
  Font,
  type DocumentProps,
} from '@react-pdf/renderer'
import type { CVWithRelations, CVTemplate } from '@/types/cv'

// Disable automatic hyphenation to prevent word breaks across lines and avoid CJS packaging issues
Font.registerHyphenationCallback((word) => [word])

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatUrlDisplay(url?: string | null): string {
  if (!url) return ''
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
}

const MONTHS_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

const MONTHS_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export const PDF_LABELS = {
  id: {
    summary: 'Ringkasan Profesional',
    executiveSummary: 'Ringkasan Eksekutif',
    experience: 'Pengalaman Kerja',
    education: 'Pendidikan',
    skills: 'Keahlian',
    keySkills: 'Keahlian Utama',
    projects: 'Proyek',
    certifications: 'Sertifikasi',
    contact: 'Kontak',
    aboutMe: 'Tentang Saya',
    present: 'Sekarang',
    pageOf: (p: number, t: number) => `Halaman ${p} dari ${t}`,
  },
  en: {
    summary: 'Professional Summary',
    executiveSummary: 'Executive Summary',
    experience: 'Experience',
    education: 'Education',
    skills: 'Skills',
    keySkills: 'Key Skills',
    projects: 'Projects',
    certifications: 'Certifications',
    contact: 'Contact',
    aboutMe: 'About Me',
    present: 'Present',
    pageOf: (p: number, t: number) => `Page ${p} of ${t}`,
  },
} as const

function formatDate(value?: string | null, language: 'id' | 'en' = 'id'): string {
  if (!value) return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  const months = language === 'en' ? MONTHS_EN : MONTHS_ID

  // Format YYYY-MM-DD -> e.g. 26 Maret 2000 or 26 March 2000
  const ymdMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
  if (ymdMatch) {
    const year = ymdMatch[1]
    const mIndex = parseInt(ymdMatch[2], 10) - 1
    const day = parseInt(ymdMatch[3], 10)
    if (mIndex >= 0 && mIndex < 12) {
      return `${day} ${months[mIndex]} ${year}`
    }
  }

  // Format YYYY-MM -> e.g. Maret 2000 or March 2000
  const ymMatch = /^(\d{4})-(\d{2})$/.exec(trimmed)
  if (ymMatch) {
    const year = ymMatch[1]
    const mIndex = parseInt(ymMatch[2], 10) - 1
    if (mIndex >= 0 && mIndex < 12) {
      return `${months[mIndex]} ${year}`
    }
  }

  // Format YYYY
  if (/^\d{4}$/.test(trimmed)) {
    return trimmed
  }

  return trimmed
}

function formatDateRange(
  start?: string | null,
  end?: string | null,
  isCurrent?: boolean,
  language: 'id' | 'en' = 'id'
): string {
  if (!start && !end) return ''
  const startLabel = formatDate(start, language)
  const endLabel = formatDate(end, language)
  const presentLabel = language === 'en' ? 'Present' : 'Sekarang'
  if (isCurrent) {
    return startLabel ? `${startLabel} – ${presentLabel}` : presentLabel
  }
  if (startLabel && endLabel) return `${startLabel} – ${endLabel}`
  return startLabel || endLabel
}

// ── 1. ATS Template (Monochrome, Single Column, High ATS Parseability) ────────

const atsStyles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 9.5,
    fontFamily: 'Helvetica',
    lineHeight: 1.35,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 8,
    textAlign: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    lineHeight: 1.15,
    color: '#111827',
  },
  title: {
    fontSize: 10.5,
    fontFamily: 'Helvetica',
    color: '#374151',
    textTransform: 'uppercase',
    lineHeight: 1.25,
    marginTop: 5,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 7,
  },
  contactItem: {
    fontSize: 8.5,
    color: '#4b5563',
    marginHorizontal: 3,
  },
  contactLink: {
    fontSize: 8.5,
    color: '#111827',
    textDecoration: 'none',
  },
  bullet: {
    fontSize: 8.5,
    color: '#9ca3af',
  },
  headerDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#111827',
    marginTop: 8,
    marginBottom: 5,
  },
  section: {
    marginTop: 8,
    marginBottom: 3,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#111827',
    borderBottomWidth: 0.75,
    borderBottomColor: '#6b7280',
    paddingBottom: 1.5,
    marginBottom: 4,
  },
  entry: {
    marginBottom: 5,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  entryTitle: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    flexGrow: 1,
    flexShrink: 1,
    paddingRight: 8,
  },
  entryDate: {
    fontSize: 8.5,
    color: '#4b5563',
    flexShrink: 0,
    marginLeft: 8,
    textAlign: 'right',
  },
  entrySubheader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 1,
  },
  entryCompany: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Oblique',
    color: '#374151',
    flexGrow: 1,
    flexShrink: 1,
    paddingRight: 8,
  },
  entryLocation: {
    fontSize: 8.5,
    color: '#6b7280',
    flexShrink: 0,
    marginLeft: 8,
    textAlign: 'right',
  },
  entryText: {
    fontSize: 8.5,
    color: '#374151',
    lineHeight: 1.35,
    marginTop: 2,
  },
  skillsText: {
    fontSize: 8.5,
    color: '#374151',
    lineHeight: 1.4,
  },
  link: {
    color: '#111827',
    textDecoration: 'none',
  },
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 36,
    right: 36,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
  },
})

export function AtsPDFDocument({
  cv,
  language = 'id',
}: {
  cv: CVWithRelations
  language?: 'id' | 'en'
}) {
  const info = cv.personal_info || {}
  const experiences = [...(cv.experiences || [])].sort((a, b) => a.sort_order - b.sort_order)
  const educations = [...(cv.educations || [])].sort((a, b) => a.sort_order - b.sort_order)
  const projects = [...(cv.projects || [])].sort((a, b) => a.sort_order - b.sort_order)
  const certifications = [...(cv.certifications || [])].sort((a, b) => a.sort_order - b.sort_order)
  const skills = (cv.skills || []).filter(Boolean)
  const labels = PDF_LABELS[language] || PDF_LABELS.id

  const contactItems: { label: string; href?: string; prefix?: string }[] = []
  if (info.phone) contactItems.push({ label: info.phone, href: `tel:${info.phone}` })
  if (info.email) contactItems.push({ label: info.email, href: `mailto:${info.email}` })
  if (info.location) contactItems.push({ label: info.location })
  if (info.linkedin) contactItems.push({ label: `LinkedIn: ${formatUrlDisplay(info.linkedin)}`, href: info.linkedin })
  if (info.github) contactItems.push({ label: `GitHub: ${formatUrlDisplay(info.github)}`, href: info.github })
  if (info.portfolio) contactItems.push({ label: formatUrlDisplay(info.portfolio), href: info.portfolio })

  return (
    <Document title={`${info.full_name || cv.name || 'CV'} - ATS Resume`} author={info.full_name || 'CV Tracker'}>
      <Page size="A4" style={atsStyles.page} wrap>
        {/* Header */}
        <View style={atsStyles.header}>
          <Text style={atsStyles.name}>{info.full_name || cv.name || 'Candidate Name'}</Text>
          {info.professional_title ? <Text style={atsStyles.title}>{info.professional_title}</Text> : null}
          {contactItems.length > 0 && (
            <View style={atsStyles.contactRow}>
              {contactItems.map((item, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <Text style={atsStyles.bullet}> • </Text>}
                  {item.href ? (
                    <Link src={item.href} style={atsStyles.contactLink}>
                      {item.label}
                    </Link>
                  ) : (
                    <Text style={atsStyles.contactItem}>{item.label}</Text>
                  )}
                </React.Fragment>
              ))}
            </View>
          )}
        </View>
        <View style={atsStyles.headerDivider} />

        {/* Summary */}
        {cv.summary ? (
          <View style={atsStyles.section}>
            <Text style={atsStyles.sectionTitle}>{labels.summary}</Text>
            <Text style={atsStyles.entryText}>{cv.summary}</Text>
          </View>
        ) : null}

        {/* Experience */}
        {experiences.length > 0 && (
          <View style={atsStyles.section}>
            <Text style={atsStyles.sectionTitle}>{labels.experience}</Text>
            {experiences.map((exp, idx) => {
              const dateStr = formatDateRange(exp.start_date, exp.end_date, exp.is_current, language)
              return (
                <View key={exp.id || idx} style={atsStyles.entry} wrap={false}>
                  <View style={atsStyles.entryHeader}>
                    <Text style={atsStyles.entryTitle}>{exp.position}</Text>
                    {dateStr ? <Text style={atsStyles.entryDate}>{dateStr}</Text> : null}
                  </View>
                  <View style={atsStyles.entrySubheader}>
                    <Text style={atsStyles.entryCompany}>{exp.company}</Text>
                    {exp.location ? <Text style={atsStyles.entryLocation}>{exp.location}</Text> : null}
                  </View>
                  {exp.description ? <Text style={atsStyles.entryText}>{exp.description}</Text> : null}
                </View>
              )
            })}
          </View>
        )}

        {/* Education */}
        {educations.length > 0 && (
          <View style={atsStyles.section}>
            <Text style={atsStyles.sectionTitle}>{labels.education}</Text>
            {educations.map((edu, idx) => {
              const dateStr = formatDateRange(edu.start_date, edu.end_date, false, language)
              const degreeField = [edu.degree, edu.field_of_study].filter(Boolean).join(' in ')
              return (
                <View key={edu.id || idx} style={atsStyles.entry} wrap={false}>
                  <View style={atsStyles.entryHeader}>
                    <Text style={atsStyles.entryTitle}>{edu.institution}</Text>
                    {dateStr ? <Text style={atsStyles.entryDate}>{dateStr}</Text> : null}
                  </View>
                  {degreeField ? (
                    <View style={atsStyles.entrySubheader}>
                      <Text style={atsStyles.entryCompany}>{degreeField}</Text>
                    </View>
                  ) : null}
                  {edu.description ? <Text style={atsStyles.entryText}>{edu.description}</Text> : null}
                </View>
              )
            })}
          </View>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <View style={atsStyles.section}>
            <Text style={atsStyles.sectionTitle}>{labels.skills}</Text>
            <Text style={atsStyles.skillsText}>{skills.join(' • ')}</Text>
          </View>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <View style={atsStyles.section}>
            <Text style={atsStyles.sectionTitle}>{labels.projects}</Text>
            {projects.map((proj, idx) => {
              const dateStr = formatDateRange(proj.start_date, proj.end_date, false, language)
              return (
                <View key={proj.id || idx} style={atsStyles.entry} wrap={false}>
                  <View style={atsStyles.entryHeader}>
                    {proj.project_url ? (
                      <Link src={proj.project_url} style={atsStyles.link}>
                        <Text style={atsStyles.entryTitle}>{proj.name}</Text>
                      </Link>
                    ) : (
                      <Text style={atsStyles.entryTitle}>{proj.name}</Text>
                    )}
                    {dateStr ? <Text style={atsStyles.entryDate}>{dateStr}</Text> : null}
                  </View>
                  {proj.description ? <Text style={atsStyles.entryText}>{proj.description}</Text> : null}
                </View>
              )
            })}
          </View>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <View style={atsStyles.section}>
            <Text style={atsStyles.sectionTitle}>{labels.certifications}</Text>
            {certifications.map((cert, idx) => (
              <View key={cert.id || idx} style={atsStyles.entry} wrap={false}>
                <View style={atsStyles.entryHeader}>
                  {cert.credential_url ? (
                    <Link src={cert.credential_url} style={atsStyles.link}>
                      <Text style={atsStyles.entryTitle}>{cert.name}</Text>
                    </Link>
                  ) : (
                    <Text style={atsStyles.entryTitle}>{cert.name}</Text>
                  )}
                  {cert.issue_date ? <Text style={atsStyles.entryDate}>{formatDate(cert.issue_date, language)}</Text> : null}
                </View>
                {cert.issuer ? (
                  <View style={atsStyles.entrySubheader}>
                    <Text style={atsStyles.entryCompany}>{cert.issuer}</Text>
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        )}

        {/* Multi-page footer */}
        <Text
          style={atsStyles.footer}
          render={({ pageNumber, totalPages }) => (totalPages > 1 ? labels.pageOf(pageNumber, totalPages) : '')}
          fixed
        />
      </Page>
    </Document>
  )
}

// ── 2. Professional Template (Navy/Slate, Executive Theme, Pill Badges) ───────

const profStyles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 9,
    fontFamily: 'Helvetica',
    lineHeight: 1.35,
    color: '#334155',
    backgroundColor: '#ffffff',
  },
  accentBar: {
    height: 4,
    backgroundColor: '#1e40af',
    marginBottom: 8,
  },
  header: {
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 8,
  },
  name: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    letterSpacing: -0.2,
    lineHeight: 1.15,
  },
  title: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    color: '#1e40af',
    lineHeight: 1.25,
    marginTop: 5,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    alignItems: 'center',
  },
  contactItem: {
    fontSize: 8.5,
    color: '#475569',
    marginRight: 10,
    marginVertical: 1,
  },
  contactLink: {
    fontSize: 8.5,
    color: '#1e40af',
    textDecoration: 'none',
    marginRight: 10,
    marginVertical: 1,
  },
  section: {
    marginTop: 7,
    marginBottom: 3,
  },
  sectionTitle: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#1e40af',
    borderBottomWidth: 1.5,
    borderBottomColor: '#1e40af',
    paddingBottom: 2,
    marginBottom: 5,
  },
  entry: {
    marginBottom: 6,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  entryTitle: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    flexGrow: 1,
    flexShrink: 1,
    paddingRight: 8,
  },
  entryDate: {
    fontSize: 8.5,
    color: '#64748b',
    flexShrink: 0,
    marginLeft: 8,
    textAlign: 'right',
  },
  entrySubheader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 1,
  },
  entryCompany: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#334155',
    flexGrow: 1,
    flexShrink: 1,
    paddingRight: 8,
  },
  entryLocation: {
    fontSize: 8.5,
    color: '#64748b',
    flexShrink: 0,
    marginLeft: 8,
    textAlign: 'right',
  },
  entryText: {
    fontSize: 8.5,
    color: '#334155',
    lineHeight: 1.35,
    marginTop: 2,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillPill: {
    backgroundColor: '#f1f5f9',
    borderWidth: 0.5,
    borderColor: '#cbd5e1',
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 4,
  },
  skillText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
  },
  link: {
    color: '#1e40af',
    textDecoration: 'none',
  },
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 32,
    right: 32,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
  },
})

export function ProfessionalPDFDocument({
  cv,
  language = 'id',
}: {
  cv: CVWithRelations
  language?: 'id' | 'en'
}) {
  const info = cv.personal_info || {}
  const experiences = [...(cv.experiences || [])].sort((a, b) => a.sort_order - b.sort_order)
  const educations = [...(cv.educations || [])].sort((a, b) => a.sort_order - b.sort_order)
  const projects = [...(cv.projects || [])].sort((a, b) => a.sort_order - b.sort_order)
  const certifications = [...(cv.certifications || [])].sort((a, b) => a.sort_order - b.sort_order)
  const skills = (cv.skills || []).filter(Boolean)
  const labels = PDF_LABELS[language] || PDF_LABELS.id

  const contactItems: { label: string; href?: string }[] = []
  if (info.phone) contactItems.push({ label: info.phone, href: `tel:${info.phone}` })
  if (info.email) contactItems.push({ label: info.email, href: `mailto:${info.email}` })
  if (info.location) contactItems.push({ label: info.location })
  if (info.linkedin) contactItems.push({ label: `LinkedIn: ${formatUrlDisplay(info.linkedin)}`, href: info.linkedin })
  if (info.github) contactItems.push({ label: `GitHub: ${formatUrlDisplay(info.github)}`, href: info.github })
  if (info.portfolio) contactItems.push({ label: formatUrlDisplay(info.portfolio), href: info.portfolio })

  return (
    <Document
      title={`${info.full_name || cv.name || 'CV'} - Professional Resume`}
      author={info.full_name || 'CV Tracker'}
    >
      <Page size="A4" style={profStyles.page} wrap>
        {/* Accent Top Bar */}
        <View style={profStyles.accentBar} />

        {/* Header */}
        <View style={profStyles.header}>
          <Text style={profStyles.name}>{info.full_name || cv.name || 'Candidate Name'}</Text>
          {info.professional_title ? <Text style={profStyles.title}>{info.professional_title}</Text> : null}
          {contactItems.length > 0 && (
            <View style={profStyles.contactRow}>
              {contactItems.map((item, idx) =>
                item.href ? (
                  <Link key={idx} src={item.href} style={profStyles.contactLink}>
                    {item.label}
                  </Link>
                ) : (
                  <Text key={idx} style={profStyles.contactItem}>
                    {item.label}
                  </Text>
                )
              )}
            </View>
          )}
        </View>

        {/* Executive Summary */}
        {cv.summary ? (
          <View style={profStyles.section}>
            <Text style={profStyles.sectionTitle}>{labels.executiveSummary}</Text>
            <Text style={profStyles.entryText}>{cv.summary}</Text>
          </View>
        ) : null}

        {/* Professional Experience */}
        {experiences.length > 0 && (
          <View style={profStyles.section}>
            <Text style={profStyles.sectionTitle}>{labels.experience}</Text>
            {experiences.map((exp, idx) => {
              const dateStr = formatDateRange(exp.start_date, exp.end_date, exp.is_current, language)
              return (
                <View key={exp.id || idx} style={profStyles.entry} wrap={false}>
                  <View style={profStyles.entryHeader}>
                    <Text style={profStyles.entryTitle}>{exp.position}</Text>
                    {dateStr ? <Text style={profStyles.entryDate}>{dateStr}</Text> : null}
                  </View>
                  <View style={profStyles.entrySubheader}>
                    <Text style={profStyles.entryCompany}>{exp.company}</Text>
                    {exp.location ? <Text style={profStyles.entryLocation}>{exp.location}</Text> : null}
                  </View>
                  {exp.description ? <Text style={profStyles.entryText}>{exp.description}</Text> : null}
                </View>
              )
            })}
          </View>
        )}

        {/* Education & Credentials */}
        {educations.length > 0 && (
          <View style={profStyles.section}>
            <Text style={profStyles.sectionTitle}>{labels.education}</Text>
            {educations.map((edu, idx) => {
              const dateStr = formatDateRange(edu.start_date, edu.end_date, false, language)
              const degreeField = [edu.degree, edu.field_of_study].filter(Boolean).join(' in ')
              return (
                <View key={edu.id || idx} style={profStyles.entry} wrap={false}>
                  <View style={profStyles.entryHeader}>
                    <Text style={profStyles.entryTitle}>{edu.institution}</Text>
                    {dateStr ? <Text style={profStyles.entryDate}>{dateStr}</Text> : null}
                  </View>
                  {degreeField ? (
                    <View style={profStyles.entrySubheader}>
                      <Text style={profStyles.entryCompany}>{degreeField}</Text>
                    </View>
                  ) : null}
                  {edu.description ? <Text style={profStyles.entryText}>{edu.description}</Text> : null}
                </View>
              )
            })}
          </View>
        )}

        {/* Key Skills */}
        {skills.length > 0 && (
          <View style={profStyles.section}>
            <Text style={profStyles.sectionTitle}>{labels.keySkills}</Text>
            <View style={profStyles.skillsContainer}>
              {skills.map((skill, idx) => (
                <View key={idx} style={profStyles.skillPill}>
                  <Text style={profStyles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Featured Projects */}
        {projects.length > 0 && (
          <View style={profStyles.section}>
            <Text style={profStyles.sectionTitle}>{labels.projects}</Text>
            {projects.map((proj, idx) => {
              const dateStr = formatDateRange(proj.start_date, proj.end_date, false, language)
              return (
                <View key={proj.id || idx} style={profStyles.entry} wrap={false}>
                  <View style={profStyles.entryHeader}>
                    {proj.project_url ? (
                      <Link src={proj.project_url} style={profStyles.link}>
                        <Text style={profStyles.entryTitle}>{proj.name}</Text>
                      </Link>
                    ) : (
                      <Text style={profStyles.entryTitle}>{proj.name}</Text>
                    )}
                    {dateStr ? <Text style={profStyles.entryDate}>{dateStr}</Text> : null}
                  </View>
                  {proj.description ? <Text style={profStyles.entryText}>{proj.description}</Text> : null}
                </View>
              )
            })}
          </View>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <View style={profStyles.section}>
            <Text style={profStyles.sectionTitle}>{labels.certifications}</Text>
            {certifications.map((cert, idx) => (
              <View key={cert.id || idx} style={profStyles.entry} wrap={false}>
                <View style={profStyles.entryHeader}>
                  {cert.credential_url ? (
                    <Link src={cert.credential_url} style={profStyles.link}>
                      <Text style={profStyles.entryTitle}>{cert.name}</Text>
                    </Link>
                  ) : (
                    <Text style={profStyles.entryTitle}>{cert.name}</Text>
                  )}
                  {cert.issue_date ? <Text style={profStyles.entryDate}>{formatDate(cert.issue_date, language)}</Text> : null}
                </View>
                {cert.issuer ? (
                  <View style={profStyles.entrySubheader}>
                    <Text style={profStyles.entryCompany}>{cert.issuer}</Text>
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        )}

        {/* Multi-page footer */}
        <Text
          style={profStyles.footer}
          render={({ pageNumber, totalPages }) => (totalPages > 1 ? labels.pageOf(pageNumber, totalPages) : '')}
          fixed
        />
      </Page>
    </Document>
  )
}

// ── 3. Modern Template (Contemporary Aesthetic, Blue Accents, Header Card) ─

const modernStyles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
    lineHeight: 1.35,
    color: '#334155',
    backgroundColor: '#ffffff',
  },
  headerCard: {
    backgroundColor: '#0f172a',
    borderRadius: 4,
    padding: 12,
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photo: {
    width: 52,
    height: 52,
    borderRadius: 6,
    marginRight: 12,
    objectFit: 'cover',
  },
  headerDetails: {
    flex: 1,
  },
  name: {
    fontSize: 19,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    letterSpacing: -0.2,
    lineHeight: 1.15,
  },
  title: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#93c5fd',
    lineHeight: 1.25,
    marginTop: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    alignItems: 'center',
  },
  contactItem: {
    fontSize: 8,
    color: '#cbd5e1',
    marginRight: 8,
    marginVertical: 1,
  },
  contactLink: {
    fontSize: 8,
    color: '#bfdbfe',
    textDecoration: 'none',
    marginRight: 8,
    marginVertical: 1,
  },
  section: {
    marginTop: 7,
    marginBottom: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 2,
  },
  accentDot: {
    width: 3,
    height: 10,
    backgroundColor: '#2563eb',
    marginRight: 4,
    borderRadius: 1,
  },
  sectionTitle: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#0f172a',
  },
  entry: {
    marginBottom: 6,
    paddingLeft: 4,
    borderLeftWidth: 1.5,
    borderLeftColor: '#e2e8f0',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  entryTitle: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    flexGrow: 1,
    flexShrink: 1,
    paddingRight: 8,
  },
  entryDate: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#2563eb',
    flexShrink: 0,
    marginLeft: 8,
    textAlign: 'right',
  },
  entrySubheader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 1,
  },
  entryCompany: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#475569',
    flexGrow: 1,
    flexShrink: 1,
    paddingRight: 8,
  },
  entryLocation: {
    fontSize: 8,
    color: '#94a3b8',
    flexShrink: 0,
    marginLeft: 8,
    textAlign: 'right',
  },
  entryText: {
    fontSize: 8.5,
    color: '#334155',
    lineHeight: 1.35,
    marginTop: 2,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    backgroundColor: '#eff6ff',
    borderWidth: 0.5,
    borderColor: '#bfdbfe',
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 4,
  },
  skillText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#1e40af',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
  },
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
  },
})

export function ModernPDFDocument({
  cv,
  language = 'id',
}: {
  cv: CVWithRelations
  language?: 'id' | 'en'
}) {
  const info = cv.personal_info || {}
  const experiences = [...(cv.experiences || [])].sort((a, b) => a.sort_order - b.sort_order)
  const educations = [...(cv.educations || [])].sort((a, b) => a.sort_order - b.sort_order)
  const projects = [...(cv.projects || [])].sort((a, b) => a.sort_order - b.sort_order)
  const certifications = [...(cv.certifications || [])].sort((a, b) => a.sort_order - b.sort_order)
  const skills = (cv.skills || []).filter(Boolean)
  const labels = PDF_LABELS[language] || PDF_LABELS.id

  const contactItems: { label: string; href?: string }[] = []
  if (info.phone) contactItems.push({ label: info.phone, href: `tel:${info.phone}` })
  if (info.email) contactItems.push({ label: info.email, href: `mailto:${info.email}` })
  if (info.location) contactItems.push({ label: info.location })
  if (info.linkedin) contactItems.push({ label: `LinkedIn: ${formatUrlDisplay(info.linkedin)}`, href: info.linkedin })
  if (info.github) contactItems.push({ label: `GitHub: ${formatUrlDisplay(info.github)}`, href: info.github })
  if (info.portfolio) contactItems.push({ label: formatUrlDisplay(info.portfolio), href: info.portfolio })

  return (
    <Document
      title={`${info.full_name || cv.name || 'CV'} - Modern Resume`}
      author={info.full_name || 'CV Tracker'}
    >
      <Page size="A4" style={modernStyles.page} wrap>
        {/* Dark Modern Header Card */}
        <View style={modernStyles.headerCard}>
          <View style={modernStyles.headerContent}>
            {info.photo_url ? (
              <Image src={info.photo_url} style={modernStyles.photo} />
            ) : null}
            <View style={modernStyles.headerDetails}>
              <Text style={modernStyles.name}>{info.full_name || cv.name || 'Candidate Name'}</Text>
              {info.professional_title ? <Text style={modernStyles.title}>{info.professional_title}</Text> : null}
              {contactItems.length > 0 && (
                <View style={modernStyles.contactRow}>
                  {contactItems.map((item, idx) =>
                    item.href ? (
                      <Link key={idx} src={item.href} style={modernStyles.contactLink}>
                        {item.label}
                      </Link>
                    ) : (
                      <Text key={idx} style={modernStyles.contactItem}>
                        {item.label}
                      </Text>
                    )
                  )}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Summary */}
        {cv.summary ? (
          <View style={modernStyles.section}>
            <View style={modernStyles.sectionHeader}>
              <View style={modernStyles.accentDot} />
              <Text style={modernStyles.sectionTitle}>{labels.summary}</Text>
            </View>
            <Text style={modernStyles.entryText}>{cv.summary}</Text>
          </View>
        ) : null}

        {/* Experience */}
        {experiences.length > 0 && (
          <View style={modernStyles.section}>
            <View style={modernStyles.sectionHeader}>
              <View style={modernStyles.accentDot} />
              <Text style={modernStyles.sectionTitle}>{labels.experience}</Text>
            </View>
            {experiences.map((exp, idx) => {
              const dateStr = formatDateRange(exp.start_date, exp.end_date, exp.is_current, language)
              return (
                <View key={exp.id || idx} style={modernStyles.entry} wrap={false}>
                  <View style={modernStyles.entryHeader}>
                    <Text style={modernStyles.entryTitle}>{exp.position}</Text>
                    {dateStr ? <Text style={modernStyles.entryDate}>{dateStr}</Text> : null}
                  </View>
                  <View style={modernStyles.entrySubheader}>
                    <Text style={modernStyles.entryCompany}>{exp.company}</Text>
                    {exp.location ? <Text style={modernStyles.entryLocation}>{exp.location}</Text> : null}
                  </View>
                  {exp.description ? <Text style={modernStyles.entryText}>{exp.description}</Text> : null}
                </View>
              )
            })}
          </View>
        )}

        {/* Education */}
        {educations.length > 0 && (
          <View style={modernStyles.section}>
            <View style={modernStyles.sectionHeader}>
              <View style={modernStyles.accentDot} />
              <Text style={modernStyles.sectionTitle}>{labels.education}</Text>
            </View>
            {educations.map((edu, idx) => {
              const dateStr = formatDateRange(edu.start_date, edu.end_date, false, language)
              const degreeField = [edu.degree, edu.field_of_study].filter(Boolean).join(' in ')
              return (
                <View key={edu.id || idx} style={modernStyles.entry} wrap={false}>
                  <View style={modernStyles.entryHeader}>
                    <Text style={modernStyles.entryTitle}>{edu.institution}</Text>
                    {dateStr ? <Text style={modernStyles.entryDate}>{dateStr}</Text> : null}
                  </View>
                  {degreeField ? (
                    <View style={modernStyles.entrySubheader}>
                      <Text style={modernStyles.entryCompany}>{degreeField}</Text>
                    </View>
                  ) : null}
                  {edu.description ? <Text style={modernStyles.entryText}>{edu.description}</Text> : null}
                </View>
              )
            })}
          </View>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <View style={modernStyles.section}>
            <View style={modernStyles.sectionHeader}>
              <View style={modernStyles.accentDot} />
              <Text style={modernStyles.sectionTitle}>{labels.skills}</Text>
            </View>
            <View style={modernStyles.skillsContainer}>
              {skills.map((skill, idx) => (
                <View key={idx} style={modernStyles.skillTag}>
                  <Text style={modernStyles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <View style={modernStyles.section}>
            <View style={modernStyles.sectionHeader}>
              <View style={modernStyles.accentDot} />
              <Text style={modernStyles.sectionTitle}>{labels.projects}</Text>
            </View>
            {projects.map((proj, idx) => {
              const dateStr = formatDateRange(proj.start_date, proj.end_date, false, language)
              return (
                <View key={proj.id || idx} style={modernStyles.entry} wrap={false}>
                  <View style={modernStyles.entryHeader}>
                    {proj.project_url ? (
                      <Link src={proj.project_url} style={modernStyles.link}>
                        <Text style={modernStyles.entryTitle}>{proj.name}</Text>
                      </Link>
                    ) : (
                      <Text style={modernStyles.entryTitle}>{proj.name}</Text>
                    )}
                    {dateStr ? <Text style={modernStyles.entryDate}>{dateStr}</Text> : null}
                  </View>
                  {proj.description ? <Text style={modernStyles.entryText}>{proj.description}</Text> : null}
                </View>
              )
            })}
          </View>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <View style={modernStyles.section}>
            <View style={modernStyles.sectionHeader}>
              <View style={modernStyles.accentDot} />
              <Text style={modernStyles.sectionTitle}>{labels.certifications}</Text>
            </View>
            {certifications.map((cert, idx) => (
              <View key={cert.id || idx} style={modernStyles.entry} wrap={false}>
                <View style={modernStyles.entryHeader}>
                  {cert.credential_url ? (
                    <Link src={cert.credential_url} style={modernStyles.link}>
                      <Text style={modernStyles.entryTitle}>{cert.name}</Text>
                    </Link>
                  ) : (
                    <Text style={modernStyles.entryTitle}>{cert.name}</Text>
                  )}
                  {cert.issue_date ? <Text style={modernStyles.entryDate}>{formatDate(cert.issue_date, language)}</Text> : null}
                </View>
                {cert.issuer ? (
                  <View style={modernStyles.entrySubheader}>
                    <Text style={modernStyles.entryCompany}>{cert.issuer}</Text>
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        )}

        {/* Multi-page footer */}
        <Text
          style={modernStyles.footer}
          render={({ pageNumber, totalPages }) => (totalPages > 1 ? labels.pageOf(pageNumber, totalPages) : '')}
          fixed
        />
      </Page>
    </Document>
  )
}

// ── Universal Factory ─────────────────────────────────────────────────────────

export function createPDFDocument(
  cv: CVWithRelations,
  templateOverride?: CVTemplate | string,
  language: 'id' | 'en' = 'id'
): React.ReactElement<DocumentProps> {
  const selectedTemplate = (templateOverride || cv.template || 'ats').toString().toLowerCase()

  switch (selectedTemplate) {
    case 'modern':
      return <ModernPDFDocument cv={cv} language={language} />
    case 'professional':
      return <ProfessionalPDFDocument cv={cv} language={language} />
    case 'ats':
    default:
      return <AtsPDFDocument cv={cv} language={language} />
  }
}
