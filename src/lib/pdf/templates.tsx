import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  Link,
  Image as PDFImage,
  StyleSheet,
  Font,
  type DocumentProps,
} from '@react-pdf/renderer'
import type { CVTemplate, CVWithRelations, DocumentLanguage } from '@/types/cv'
import {
  buildCVDocument,
  educationHeading,
  formatDateRange,
  formatDisplayUrl,
  formatMonthYear,
  parseDescription,
  type CVDocument,
  type SectionKey,
} from '@/lib/cv/document'

// Keep words whole; hyphenation also pulls in a CJS dependency we patch around.
Font.registerHyphenationCallback((word) => [word])

// Sizes mirror the HTML preview at 96dpi (1px = 0.75pt, 1mm = 2.835pt) so the
// preview and the downloaded PDF look like the same document.
const mm = (value: number) => value * 2.835

type Styles = ReturnType<typeof StyleSheet.create>

function DescriptionPDF({ text, styles }: { text?: string | null; styles: Styles }) {
  const blocks = parseDescription(text)
  if (blocks.length === 0) return null
  return (
    <View style={styles.description}>
      {blocks.map((block, idx) =>
        block.type === 'list' ? (
          <View key={idx}>
            {block.items.map((item, itemIdx) => (
              <View key={itemIdx} style={styles.bulletRow}>
                <Text style={styles.bulletMark}>•</Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text key={idx} style={styles.paragraph}>
            {block.text}
          </Text>
        )
      )}
    </View>
  )
}

function PageNumber({ doc, style }: { doc: CVDocument; style: Styles[string] }) {
  return (
    <Text
      style={style}
      fixed
      render={({ pageNumber, totalPages }) => (totalPages > 1 ? doc.labels.pageOf(pageNumber, totalPages) : '')}
    />
  )
}

function documentMeta(doc: CVDocument) {
  return { title: `${doc.name || 'CV'} - CV`, author: doc.name || undefined, language: doc.language }
}

// ── ATS Clean ────────────────────────────────────────────────────────────────

const ats = StyleSheet.create({
  page: {
    paddingHorizontal: mm(18),
    paddingVertical: mm(16),
    fontFamily: 'Helvetica',
    fontSize: 9,
    lineHeight: 1.35,
    color: '#262626',
  },
  name: { fontFamily: 'Helvetica-Bold', fontSize: 18, lineHeight: 1.2, color: '#0a0a0a' },
  title: { fontSize: 9.75, marginTop: 2, color: '#262626' },
  contacts: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 5, fontSize: 8.6, color: '#404040' },
  contactSep: { marginHorizontal: 4, color: '#404040' },
  contactLink: { color: '#404040', textDecoration: 'none' },
  header: { marginBottom: 12 },
  section: { marginBottom: 12 },
  heading: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#0a0a0a',
    borderBottomWidth: 0.75,
    borderBottomColor: '#262626',
    paddingBottom: 1.5,
    marginBottom: 5,
  },
  entry: { marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  strong: { fontFamily: 'Helvetica-Bold', color: '#0a0a0a', flexShrink: 1, paddingRight: 10 },
  grow: { flexShrink: 1, paddingRight: 10 },
  date: { flexShrink: 0, textAlign: 'right' },
  muted: { flexShrink: 0, textAlign: 'right', color: '#404040' },
  link: { color: '#404040', textDecoration: 'none' },
  description: { marginTop: 3 },
  paragraph: { fontSize: 9, marginBottom: 2, lineHeight: 1.45 },
  bulletRow: { flexDirection: 'row', marginBottom: 1.5 },
  bulletMark: { fontSize: 9, width: 9, lineHeight: 1.45 },
  bulletText: { fontSize: 9, flex: 1, lineHeight: 1.45 },
  body: { fontSize: 9, lineHeight: 1.5 },
  footer: { position: 'absolute', bottom: mm(8), left: 0, right: 0, textAlign: 'center', fontSize: 7.5, color: '#737373' },
})

function AtsSection({ doc, section }: { doc: CVDocument; section: SectionKey }) {
  const { labels, language } = doc
  const heading = (text: string) => (
    <Text style={ats.heading} minPresenceAhead={30}>
      {text}
    </Text>
  )
  switch (section) {
    case 'summary':
      return (
        <View style={ats.section}>
          {heading(labels.summary)}
          <Text style={ats.body}>{doc.summary}</Text>
        </View>
      )
    case 'skills':
      return (
        <View style={ats.section}>
          {heading(labels.skills)}
          <Text style={ats.body}>{doc.skills.join(', ')}</Text>
        </View>
      )
    case 'experience':
      return (
        <View style={ats.section}>
          {heading(labels.experience)}
          {doc.experiences.map((exp, idx) => (
            <View key={exp.id || idx} style={ats.entry} wrap={false}>
              <View style={ats.row}>
                <Text style={ats.strong}>{exp.position}</Text>
                <Text style={ats.date}>{formatDateRange(exp.start_date, exp.end_date, exp.is_current, language)}</Text>
              </View>
              <View style={ats.row}>
                <Text style={ats.grow}>{exp.company}</Text>
                {exp.location ? <Text style={ats.muted}>{exp.location}</Text> : null}
              </View>
              <DescriptionPDF text={exp.description} styles={ats} />
            </View>
          ))}
        </View>
      )
    case 'projects':
      return (
        <View style={ats.section}>
          {heading(labels.projects)}
          {doc.projects.map((proj, idx) => (
            <View key={proj.id || idx} style={ats.entry} wrap={false}>
              <View style={ats.row}>
                <Text style={ats.strong}>{proj.name}</Text>
                <Text style={ats.date}>{formatDateRange(proj.start_date, proj.end_date, false, language)}</Text>
              </View>
              {proj.project_url ? (
                <Link src={proj.project_url} style={ats.link}>
                  {formatDisplayUrl(proj.project_url)}
                </Link>
              ) : null}
              <DescriptionPDF text={proj.description} styles={ats} />
            </View>
          ))}
        </View>
      )
    case 'education':
      return (
        <View style={ats.section}>
          {heading(labels.education)}
          {doc.educations.map((edu, idx) => (
            <View key={edu.id || idx} style={ats.entry} wrap={false}>
              <View style={ats.row}>
                <Text style={ats.strong}>{edu.institution}</Text>
                <Text style={ats.date}>{formatDateRange(edu.start_date, edu.end_date, false, language)}</Text>
              </View>
              {educationHeading(edu) ? <Text>{educationHeading(edu)}</Text> : null}
              <DescriptionPDF text={edu.description} styles={ats} />
            </View>
          ))}
        </View>
      )
    case 'certifications':
      return (
        <View style={ats.section}>
          {heading(labels.certifications)}
          {doc.certifications.map((cert, idx) => (
            <View key={cert.id || idx} style={[ats.row, { marginBottom: 3 }]} wrap={false}>
              <Text style={ats.grow}>
                <Text style={{ fontFamily: 'Helvetica-Bold', color: '#0a0a0a' }}>{cert.name}</Text>
                {cert.issuer ? `, ${cert.issuer}` : ''}
                {cert.credential_url ? ' (' : ''}
                {cert.credential_url ? (
                  <Link src={cert.credential_url} style={ats.link}>
                    {labels.credential}
                  </Link>
                ) : null}
                {cert.credential_url ? ')' : ''}
              </Text>
              {cert.issue_date ? <Text style={ats.date}>{formatMonthYear(cert.issue_date, language)}</Text> : null}
            </View>
          ))}
        </View>
      )
  }
}

export function AtsPDFDocument({ cv, language }: { cv: CVWithRelations; language?: DocumentLanguage }) {
  const doc = buildCVDocument(cv, { language, template: 'ats' })
  return (
    <Document {...documentMeta(doc)}>
      <Page size="A4" style={ats.page} wrap>
        <View style={ats.header}>
          <Text style={ats.name}>{doc.name}</Text>
          {doc.title ? <Text style={ats.title}>{doc.title}</Text> : null}
          {doc.contacts.length > 0 ? (
            <View style={ats.contacts}>
              {doc.contacts.map((item, idx) => (
                <React.Fragment key={item.key}>
                  {idx > 0 ? <Text style={ats.contactSep}>|</Text> : null}
                  {item.href ? (
                    <Link src={item.href} style={ats.contactLink}>
                      {item.value}
                    </Link>
                  ) : (
                    <Text>{item.value}</Text>
                  )}
                </React.Fragment>
              ))}
            </View>
          ) : null}
        </View>
        {doc.sections.map((section) => (
          <AtsSection key={section} doc={doc} section={section} />
        ))}
        <PageNumber doc={doc} style={ats.footer} />
      </Page>
    </Document>
  )
}

// ── Professional ─────────────────────────────────────────────────────────────

const NAVY = '#1f3a5f'

const prof = StyleSheet.create({
  page: {
    paddingHorizontal: mm(17),
    paddingVertical: mm(15),
    fontFamily: 'Helvetica',
    fontSize: 8.6,
    lineHeight: 1.35,
    color: '#1e293b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottomWidth: 1.5,
    borderBottomColor: NAVY,
    paddingBottom: 8,
    marginBottom: 10,
  },
  headerMain: { flexShrink: 1, paddingRight: 16 },
  name: { fontFamily: 'Times-Bold', fontSize: 21, lineHeight: 1.1, color: '#020617' },
  title: { fontFamily: 'Helvetica-Bold', fontSize: 9.75, color: NAVY, marginTop: 4 },
  contacts: { flexShrink: 0, maxWidth: mm(70), alignItems: 'flex-end', fontSize: 8.25, color: '#334155' },
  contactLink: { color: '#334155', textDecoration: 'none' },
  section: {
    flexDirection: 'row',
    borderTopWidth: 0.75,
    borderTopColor: '#cbd5e1',
    paddingTop: 8,
    marginBottom: 8,
  },
  label: {
    width: mm(34),
    marginRight: mm(6),
    fontFamily: 'Helvetica-Bold',
    fontSize: 7.9,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: NAVY,
  },
  content: { flex: 1 },
  entry: { marginBottom: 9 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  strong: { fontFamily: 'Helvetica-Bold', color: '#020617', flexShrink: 1, paddingRight: 10 },
  date: { flexShrink: 0, fontSize: 8.25, color: '#475569', textAlign: 'right' },
  company: { fontFamily: 'Helvetica-Bold', color: NAVY },
  sub: { color: '#334155' },
  link: { fontSize: 8.25, color: NAVY, textDecoration: 'none' },
  body: { fontSize: 8.6, lineHeight: 1.55 },
  description: { marginTop: 3 },
  paragraph: { fontSize: 8.6, marginBottom: 2, lineHeight: 1.5 },
  bulletRow: { flexDirection: 'row', marginBottom: 1.5 },
  bulletMark: { fontSize: 8.6, width: 9, lineHeight: 1.5 },
  bulletText: { fontSize: 8.6, flex: 1, lineHeight: 1.5 },
  footer: { position: 'absolute', bottom: mm(8), left: 0, right: 0, textAlign: 'center', fontSize: 7.5, color: '#94a3b8' },
})

function ProfessionalSection({ doc, section }: { doc: CVDocument; section: SectionKey }) {
  const { labels, language } = doc
  const wrapRow = (label: string, children: React.ReactNode) => (
    <View style={prof.section} minPresenceAhead={30}>
      <Text style={prof.label}>{label}</Text>
      <View style={prof.content}>{children}</View>
    </View>
  )
  switch (section) {
    case 'summary':
      return wrapRow(labels.summary, <Text style={prof.body}>{doc.summary}</Text>)
    case 'skills':
      // One box per skill: a joined string lets the line breaker split at the separator and insert hyphens.
      return wrapRow(
        labels.skills,
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {doc.skills.map((skill, idx) => (
            <Text key={skill} style={prof.body}>
              {skill}
              {idx < doc.skills.length - 1 ? '  ·  ' : ''}
            </Text>
          ))}
        </View>
      )
    case 'experience':
      return wrapRow(
        labels.experience,
        doc.experiences.map((exp, idx) => (
          <View key={exp.id || idx} style={prof.entry} wrap={false}>
            <View style={prof.row}>
              <Text style={prof.strong}>{exp.position}</Text>
              <Text style={prof.date}>{formatDateRange(exp.start_date, exp.end_date, exp.is_current, language)}</Text>
            </View>
            <Text style={prof.sub}>
              <Text style={prof.company}>{exp.company}</Text>
              {exp.location ? `, ${exp.location}` : ''}
            </Text>
            <DescriptionPDF text={exp.description} styles={prof} />
          </View>
        ))
      )
    case 'projects':
      return wrapRow(
        labels.projects,
        doc.projects.map((proj, idx) => (
          <View key={proj.id || idx} style={prof.entry} wrap={false}>
            <View style={prof.row}>
              <Text style={prof.strong}>{proj.name}</Text>
              <Text style={prof.date}>{formatDateRange(proj.start_date, proj.end_date, false, language)}</Text>
            </View>
            {proj.project_url ? (
              <Link src={proj.project_url} style={prof.link}>
                {formatDisplayUrl(proj.project_url)}
              </Link>
            ) : null}
            <DescriptionPDF text={proj.description} styles={prof} />
          </View>
        ))
      )
    case 'education':
      return wrapRow(
        labels.education,
        doc.educations.map((edu, idx) => (
          <View key={edu.id || idx} style={prof.entry} wrap={false}>
            <View style={prof.row}>
              <Text style={prof.strong}>{edu.institution}</Text>
              <Text style={prof.date}>{formatDateRange(edu.start_date, edu.end_date, false, language)}</Text>
            </View>
            {educationHeading(edu) ? <Text style={prof.sub}>{educationHeading(edu)}</Text> : null}
            <DescriptionPDF text={edu.description} styles={prof} />
          </View>
        ))
      )
    case 'certifications':
      return wrapRow(
        labels.certifications,
        doc.certifications.map((cert, idx) => (
          <View key={cert.id || idx} style={[prof.row, { marginBottom: 3 }]} wrap={false}>
            <Text style={{ flexShrink: 1, paddingRight: 10 }}>
              {cert.credential_url ? (
                <Link src={cert.credential_url} style={{ fontFamily: 'Helvetica-Bold', color: '#020617', textDecoration: 'none' }}>
                  {cert.name}
                </Link>
              ) : (
                <Text style={{ fontFamily: 'Helvetica-Bold', color: '#020617' }}>{cert.name}</Text>
              )}
              {cert.issuer ? `, ${cert.issuer}` : ''}
            </Text>
            {cert.issue_date ? <Text style={prof.date}>{formatMonthYear(cert.issue_date, language)}</Text> : null}
          </View>
        ))
      )
  }
}

export function ProfessionalPDFDocument({ cv, language }: { cv: CVWithRelations; language?: DocumentLanguage }) {
  const doc = buildCVDocument(cv, { language, template: 'professional' })
  return (
    <Document {...documentMeta(doc)}>
      <Page size="A4" style={prof.page} wrap>
        <View style={prof.header}>
          <View style={prof.headerMain}>
            <Text style={prof.name}>{doc.name}</Text>
            {doc.title ? <Text style={prof.title}>{doc.title}</Text> : null}
          </View>
          {doc.contacts.length > 0 ? (
            <View style={prof.contacts}>
              {doc.contacts.map((item) =>
                item.href ? (
                  <Link key={item.key} src={item.href} style={prof.contactLink}>
                    {item.value}
                  </Link>
                ) : (
                  <Text key={item.key}>{item.value}</Text>
                )
              )}
            </View>
          ) : null}
        </View>
        {doc.sections.map((section) => (
          <ProfessionalSection key={section} doc={doc} section={section} />
        ))}
        <PageNumber doc={doc} style={prof.footer} />
      </Page>
    </Document>
  )
}

// ── Modern ───────────────────────────────────────────────────────────────────

const TEAL = '#155e63'
const SIDEBAR_WIDTH = mm(64)

const modern = StyleSheet.create({
  page: {
    flexDirection: 'row',
    paddingVertical: mm(14),
    fontFamily: 'Helvetica',
    fontSize: 8.6,
    lineHeight: 1.35,
    color: '#1e293b',
  },
  // Painted on every page so the sidebar colour continues after a page break.
  sidebarFill: { position: 'absolute', top: 0, bottom: 0, left: 0, width: SIDEBAR_WIDTH, backgroundColor: '#eef3f3' },
  sidebar: { width: SIDEBAR_WIDTH, paddingHorizontal: mm(7), fontSize: 8.25 },
  main: { flex: 1, paddingHorizontal: mm(9) },
  photo: { width: mm(30), height: mm(30), borderRadius: 4, objectFit: 'cover', marginBottom: 14 },
  sideSection: { marginBottom: 14 },
  sideHeading: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7.5,
    letterSpacing: 0.75,
    textTransform: 'uppercase',
    color: TEAL,
    marginBottom: 4,
  },
  contactLabel: { fontFamily: 'Helvetica-Bold', fontSize: 7.1, letterSpacing: 0.3, textTransform: 'uppercase', color: '#64748b' },
  contactValue: { color: '#1e293b', textDecoration: 'none', marginBottom: 4 },
  sideItem: { marginBottom: 7 },
  sideStrong: { fontFamily: 'Helvetica-Bold', color: '#020617' },
  sideMuted: { color: '#64748b' },
  name: { fontFamily: 'Helvetica-Bold', fontSize: 20, lineHeight: 1.2, color: '#020617' },
  title: { fontFamily: 'Helvetica-Bold', fontSize: 10, color: TEAL, marginTop: 3 },
  header: { marginBottom: 14 },
  mainSection: { marginBottom: 14 },
  mainHeading: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.25,
    letterSpacing: 0.75,
    textTransform: 'uppercase',
    color: TEAL,
    borderBottomWidth: 0.75,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 2,
    marginBottom: 5,
  },
  entry: { marginBottom: 9 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  strong: { fontFamily: 'Helvetica-Bold', color: '#020617', flexShrink: 1, paddingRight: 10 },
  date: { flexShrink: 0, fontSize: 8.25, color: '#64748b', textAlign: 'right' },
  sub: { color: '#334155' },
  link: { fontSize: 8.25, color: TEAL, textDecoration: 'none' },
  body: { fontSize: 8.6, lineHeight: 1.55 },
  description: { marginTop: 3 },
  paragraph: { fontSize: 8.6, marginBottom: 2, lineHeight: 1.5 },
  bulletRow: { flexDirection: 'row', marginBottom: 1.5 },
  bulletMark: { fontSize: 8.6, width: 9, lineHeight: 1.5 },
  bulletText: { fontSize: 8.6, flex: 1, lineHeight: 1.5 },
  footer: { position: 'absolute', bottom: mm(8), left: SIDEBAR_WIDTH, right: 0, textAlign: 'center', fontSize: 7.5, color: '#94a3b8' },
})

export function ModernPDFDocument({ cv, language }: { cv: CVWithRelations; language?: DocumentLanguage }) {
  const doc = buildCVDocument(cv, { language, template: 'modern' })
  const { labels } = doc
  const has = (key: SectionKey) => doc.sections.includes(key)
  return (
    <Document {...documentMeta(doc)}>
      <Page size="A4" style={modern.page} wrap>
        <View style={modern.sidebarFill} fixed />
        <View style={modern.sidebar}>
          {doc.photoUrl ? <PDFImage src={doc.photoUrl} style={modern.photo} /> : null}
          {doc.contacts.length > 0 ? (
            <View style={modern.sideSection}>
              <Text style={modern.sideHeading}>{labels.contact}</Text>
              {doc.contacts.map((item) => (
                <View key={item.key} wrap={false}>
                  <Text style={modern.contactLabel}>{item.label}</Text>
                  {item.href ? (
                    <Link src={item.href} style={modern.contactValue}>
                      {item.value}
                    </Link>
                  ) : (
                    <Text style={modern.contactValue}>{item.value}</Text>
                  )}
                </View>
              ))}
            </View>
          ) : null}
          {has('skills') ? (
            <View style={modern.sideSection}>
              <Text style={modern.sideHeading}>{labels.skills}</Text>
              {doc.skills.map((skill) => (
                <Text key={skill} style={{ marginBottom: 1.5 }}>
                  {skill}
                </Text>
              ))}
            </View>
          ) : null}
          {has('education') ? (
            <View style={modern.sideSection}>
              <Text style={modern.sideHeading}>{labels.education}</Text>
              {doc.educations.map((edu, idx) => (
                <View key={edu.id || idx} style={modern.sideItem} wrap={false}>
                  <Text style={modern.sideStrong}>{edu.institution}</Text>
                  {educationHeading(edu) ? <Text>{educationHeading(edu)}</Text> : null}
                  <Text style={modern.sideMuted}>{formatDateRange(edu.start_date, edu.end_date, false, doc.language)}</Text>
                  <DescriptionPDF text={edu.description} styles={modern} />
                </View>
              ))}
            </View>
          ) : null}
          {has('certifications') ? (
            <View style={modern.sideSection}>
              <Text style={modern.sideHeading}>{labels.certifications}</Text>
              {doc.certifications.map((cert, idx) => (
                <View key={cert.id || idx} style={modern.sideItem} wrap={false}>
                  {cert.credential_url ? (
                    <Link src={cert.credential_url} style={[modern.sideStrong, { textDecoration: 'none' }]}>
                      {cert.name}
                    </Link>
                  ) : (
                    <Text style={modern.sideStrong}>{cert.name}</Text>
                  )}
                  <Text style={modern.sideMuted}>
                    {[cert.issuer, formatMonthYear(cert.issue_date, doc.language)].filter(Boolean).join(', ')}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <View style={modern.main}>
          <View style={modern.header}>
            <Text style={modern.name}>{doc.name}</Text>
            {doc.title ? <Text style={modern.title}>{doc.title}</Text> : null}
          </View>
          {has('summary') ? (
            <View style={modern.mainSection}>
              <Text style={modern.mainHeading}>{labels.summary}</Text>
              <Text style={modern.body}>{doc.summary}</Text>
            </View>
          ) : null}
          {has('experience') ? (
            <View style={modern.mainSection}>
              <Text style={modern.mainHeading} minPresenceAhead={30}>
                {labels.experience}
              </Text>
              {doc.experiences.map((exp, idx) => (
                <View key={exp.id || idx} style={modern.entry} wrap={false}>
                  <View style={modern.row}>
                    <Text style={modern.strong}>{exp.position}</Text>
                    <Text style={modern.date}>
                      {formatDateRange(exp.start_date, exp.end_date, exp.is_current, doc.language)}
                    </Text>
                  </View>
                  <Text style={modern.sub}>
                    <Text style={{ fontFamily: 'Helvetica-Bold' }}>{exp.company}</Text>
                    {exp.location ? `, ${exp.location}` : ''}
                  </Text>
                  <DescriptionPDF text={exp.description} styles={modern} />
                </View>
              ))}
            </View>
          ) : null}
          {has('projects') ? (
            <View style={modern.mainSection}>
              <Text style={modern.mainHeading} minPresenceAhead={30}>
                {labels.projects}
              </Text>
              {doc.projects.map((proj, idx) => (
                <View key={proj.id || idx} style={modern.entry} wrap={false}>
                  <View style={modern.row}>
                    <Text style={modern.strong}>{proj.name}</Text>
                    <Text style={modern.date}>{formatDateRange(proj.start_date, proj.end_date, false, doc.language)}</Text>
                  </View>
                  {proj.project_url ? (
                    <Link src={proj.project_url} style={modern.link}>
                      {formatDisplayUrl(proj.project_url)}
                    </Link>
                  ) : null}
                  <DescriptionPDF text={proj.description} styles={modern} />
                </View>
              ))}
            </View>
          ) : null}
        </View>
        <PageNumber doc={doc} style={modern.footer} />
      </Page>
    </Document>
  )
}

// ── Factory ──────────────────────────────────────────────────────────────────

export function createPDFDocument(
  cv: CVWithRelations,
  templateOverride?: CVTemplate | string,
  language?: DocumentLanguage
): React.ReactElement<DocumentProps> {
  switch ((templateOverride || cv.template || 'ats').toString().toLowerCase()) {
    case 'modern':
      return <ModernPDFDocument cv={cv} language={language} />
    case 'professional':
      return <ProfessionalPDFDocument cv={cv} language={language} />
    default:
      return <AtsPDFDocument cv={cv} language={language} />
  }
}
