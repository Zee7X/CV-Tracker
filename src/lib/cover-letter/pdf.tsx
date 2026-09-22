import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  type DocumentProps,
} from '@react-pdf/renderer'
import type { CoverLetterInput } from '@/types/cover-letter'

import { formatCoverLetterDate, getCoverLetterLanguage } from './templates'

Font.registerHyphenationCallback((word) => [word])

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 44,
    fontSize: 10,
    fontFamily: 'Helvetica',
    lineHeight: 1.45,
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#2563eb',
    borderBottomStyle: 'solid',
    paddingBottom: 5,
    marginBottom: 14,
  },
  senderName: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    letterSpacing: -0.2,
    lineHeight: 1.15,
  },
  senderContact: {
    fontSize: 8.5,
    color: '#64748b',
    marginTop: 2.5,
    lineHeight: 1.15,
  },
  date: {
    fontSize: 9.5,
    color: '#334155',
    marginBottom: 12,
  },
  recipientBlock: {
    marginBottom: 16,
    fontSize: 9.5,
    color: '#1e293b',
    lineHeight: 1.35,
  },
  recipientTitle: {
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },
  companyName: {
    fontFamily: 'Helvetica-Bold',
    color: '#2563eb',
  },
  subject: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    marginBottom: 14,
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#cbd5e1',
    borderBottomStyle: 'solid',
  },
  paragraph: {
    marginBottom: 12,
    fontSize: 9.5,
    lineHeight: 1.55,
    color: '#334155',
    textAlign: 'justify',
  },
  personalSummaryBox: {
    backgroundColor: '#f8fafc',
    borderLeftWidth: 2,
    borderLeftColor: '#3b82f6',
    borderLeftStyle: 'solid',
    padding: 8,
    marginBottom: 12,
    fontSize: 9,
    color: '#334155',
    lineHeight: 1.4,
  },
  signatureBlock: {
    marginTop: 20,
    fontSize: 9.5,
    color: '#1e293b',
  },
  signOff: {
    marginBottom: 36,
  },
  signName: {
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },
})

export function CoverLetterPDFDocument({
  letter,
  language = 'id',
}: {
  letter: Partial<CoverLetterInput>
  language?: 'id' | 'en'
}): React.ReactElement<DocumentProps> {
  const docLang = getCoverLetterLanguage(letter.template, language)
  const isEn = docLang === 'en'
  const isFormalId = letter.template === 'formal_id' || (!letter.template && !isEn)

  const rawDate = letter.letter_date || new Date().toISOString().split('T')[0]
  const dateStr = formatCoverLetterDate(rawDate, isEn ? 'en' : 'id')
  const recipient = letter.recipient_name || (isEn ? 'Hiring Team' : 'Bapak/Ibu HRD')
  const contacts = [
    letter.sender_email,
    letter.sender_phone,
    letter.sender_location,
  ].filter(Boolean)

  return (
    <Document
      title={`${letter.title || (isEn ? 'Cover Letter' : 'Surat Lamaran')} - ${letter.sender_name || (isEn ? 'Applicant' : 'Pelamar')}`}
      author={letter.sender_name || 'CV Tracker'}
    >
      <Page size="A4" style={styles.page}>
        {/* Header / Sender Profile */}
        <View style={styles.header}>
          <Text style={styles.senderName}>{letter.sender_name || (isEn ? 'Your Name' : 'Nama Lengkap')}</Text>
          <Text style={styles.senderContact}>{contacts.join('  •  ')}</Text>
        </View>

        {/* Date */}
        <Text style={styles.date}>
          {letter.sender_location ? `${letter.sender_location.split(',')[0].trim()}, ` : ''}
          {dateStr}
        </Text>

        {/* Recipient Block */}
        <View style={styles.recipientBlock}>
          <Text>{isEn ? 'To:' : 'Kepada Yth.'}</Text>
          <Text style={styles.recipientTitle}>{recipient}</Text>
          <Text style={styles.companyName}>{letter.company_name || (isEn ? 'Company Name' : 'Nama Perusahaan')}</Text>
          {letter.company_address ? <Text>{letter.company_address}</Text> : null}
        </View>

        {/* Subject */}
        <Text style={styles.subject}>
          {isEn
            ? `Subject: Application for ${letter.job_title || 'Position'}`
            : `Perihal: Permohonan Lamaran Kerja — ${letter.job_title || 'Posisi'}`}
        </Text>

        {/* Opening Paragraph */}
        {letter.opening ? (
          <Text style={styles.paragraph}>{letter.opening}</Text>
        ) : null}

        {/* Data Diri Box for Formal ID */}
        {isFormalId && (
          <View style={styles.personalSummaryBox}>
            <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 2 }}>Data Diri Singkat:</Text>
            <Text>Nama: {letter.sender_name || '-'}</Text>
            <Text>Email: {letter.sender_email || '-'}</Text>
            {letter.sender_phone ? <Text>Telepon: {letter.sender_phone}</Text> : null}
            {letter.sender_location ? <Text>Lokasi: {letter.sender_location}</Text> : null}
          </View>
        )}

        {/* Main Body */}
        {letter.body ? (
          <Text style={styles.paragraph}>{letter.body}</Text>
        ) : null}

        {/* Closing Paragraph */}
        {letter.closing ? (
          <Text style={styles.paragraph}>{letter.closing}</Text>
        ) : null}

        {/* Signature */}
        <View style={styles.signatureBlock}>
          <Text style={styles.signOff}>{isEn ? 'Sincerely,' : 'Hormat saya,'}</Text>
          <Text style={styles.signName}>{letter.sender_name || 'Nama Pelamar'}</Text>
        </View>
      </Page>
    </Document>
  )
}

