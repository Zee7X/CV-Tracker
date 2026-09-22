import assert from 'node:assert/strict'
import test from 'node:test'
import { coverLetterSchema } from '../src/lib/validations/cover-letter'
import {
  generateTemplateContent,
  formatCoverLetterPlaintext,
  COVER_LETTER_TEMPLATES,
} from '../src/lib/cover-letter/templates'
import type { CoverLetterInput } from '../src/types/cover-letter'

const validLetter: CoverLetterInput = {
  title: 'Lamaran Backend Developer - PT Tokopedia',
  template: 'formal_id',
  job_title: 'Backend Developer',
  company_name: 'PT Tokopedia',
  company_address: 'Jakarta Selatan',
  recipient_name: 'Bapak/Ibu HRD',
  source: 'LinkedIn',
  letter_date: '2026-09-21',
  sender_name: 'Nadia Putri',
  sender_email: 'nadia.putri@example.com',
  sender_phone: '+62 812-3456-7890',
  sender_location: 'Jakarta, Indonesia',
  opening: 'Dengan hormat, sehubungan dengan informasi lowongan pekerjaan yang saya peroleh...',
  body: 'Saya memiliki pengalaman yang relevan dalam pengembangan sistem backend dan database.',
  closing: 'Demikian surat lamaran ini saya sampaikan, terima kasih atas perhatian Bapak/Ibu.',
}

test('accepts valid cover letter data for all supported templates', () => {
  for (const tmpl of COVER_LETTER_TEMPLATES) {
    const letter = { ...validLetter, template: tmpl.id }
    const result = coverLetterSchema.safeParse(letter)
    assert.equal(result.success, true, `Template ${tmpl.id} should validate`)
  }
})

test('rejects invalid email and missing required fields', () => {
  const invalidEmail = { ...validLetter, sender_email: 'not-an-email' }
  assert.equal(coverLetterSchema.safeParse(invalidEmail).success, false)

  const missingCompany = { ...validLetter, company_name: '' }
  assert.equal(coverLetterSchema.safeParse(missingCompany).success, false)

  const missingPosition = { ...validLetter, job_title: '' }
  assert.equal(coverLetterSchema.safeParse(missingPosition).success, false)
})

test('generateTemplateContent generates non-empty paragraphs for all templates', () => {
  for (const tmpl of COVER_LETTER_TEMPLATES) {
    const content = generateTemplateContent({
      template: tmpl.id,
      jobTitle: 'Software Engineer',
      companyName: 'Acme Corp',
      senderName: 'Jane Doe',
    })
    assert.ok(content.opening.length > 20)
    assert.ok(content.body.length > 20)
    assert.ok(content.closing.length > 20)
  }
})

test('formatCoverLetterPlaintext formats copyable text with company, position, and sender', () => {
  const plain = formatCoverLetterPlaintext(validLetter)
  assert.match(plain, /PT Tokopedia/)
  assert.match(plain, /Backend Developer/)
  assert.match(plain, /Nadia Putri/)
})

test('formatCoverLetterDate formats dates into readable words for both languages', async () => {
  const { formatCoverLetterDate } = await import('../src/lib/cover-letter/templates')
  assert.equal(formatCoverLetterDate('2026-09-22', 'id'), '22 September 2026')
  assert.equal(formatCoverLetterDate('2026-09-22', 'en'), 'September 22, 2026')
  assert.equal(formatCoverLetterDate('2026-03-05', 'id'), '5 Maret 2026')
  assert.equal(formatCoverLetterDate('2026-03-05', 'en'), 'March 5, 2026')
})

test('getCoverLetterLanguage guarantees strict language per template', async () => {
  const { getCoverLetterLanguage } = await import('../src/lib/cover-letter/templates')
  // formal_id must ALWAYS be 'id' even if app UI language is 'en'
  assert.equal(getCoverLetterLanguage('formal_id', 'en'), 'id')
  assert.equal(getCoverLetterLanguage('formal_id', 'id'), 'id')

  // professional_en must ALWAYS be 'en' even if app UI language is 'id'
  assert.equal(getCoverLetterLanguage('professional_en', 'id'), 'en')
  assert.equal(getCoverLetterLanguage('professional_en', 'en'), 'en')

  // email_short and creative adapt to fallback language
  assert.equal(getCoverLetterLanguage('email_short', 'id'), 'id')
  assert.equal(getCoverLetterLanguage('email_short', 'en'), 'en')
  assert.equal(getCoverLetterLanguage('creative', 'id'), 'id')
  assert.equal(getCoverLetterLanguage('creative', 'en'), 'en')
})

test('generateTemplateContent generates English text for professional_en', () => {
  const content = generateTemplateContent({
    template: 'professional_en',
    jobTitle: 'Backend Developer',
    companyName: 'Tokopedia',
    senderName: 'Nadia Putri',
  })
  assert.match(content.opening, /enthusiasm for the Backend Developer position at Tokopedia/)
  assert.match(content.closing, /Thank you for your time and consideration/)
})

test('generateTemplateContent generates Indonesian text for formal_id even if language is en', () => {
  const content = generateTemplateContent({
    template: 'formal_id',
    jobTitle: 'Backend Developer',
    companyName: 'Tokopedia',
    senderName: 'Nadia Putri',
    language: 'en',
  })
  assert.match(content.opening, /Dengan hormat/)
  assert.match(content.closing, /Demikian surat lamaran pekerjaan ini saya sampaikan/)
})

test('generateTemplateContent correctly embeds jobTitle, companyName, and source in Indonesian', () => {
  const content = generateTemplateContent({
    template: 'formal_id',
    jobTitle: 'Fullstack Developer',
    companyName: 'PT Astra International',
    source: 'LinkedIn',
    senderName: 'Rizick Fimelyan Sabillah',
    language: 'id',
  })
  assert.match(content.opening, /Fullstack Developer/)
  assert.match(content.opening, /PT Astra International/)
  assert.match(content.opening, /melalui LinkedIn/)
  assert.equal(content.opening.includes('[Posisi Pekerjaan]'), false)
  assert.equal(content.opening.includes('[Nama Perusahaan]'), false)
})

test('substituteCoverLetterTokens replaces placeholder tokens with provided values', async () => {
  const { substituteCoverLetterTokens } = await import('../src/lib/cover-letter/templates')
  const rawText = 'Melamar posisi [Posisi Pekerjaan] di [Nama Perusahaan] oleh [Nama Anda] kepada [Nama HRD].'
  const substituted = substituteCoverLetterTokens(rawText, {
    jobTitle: 'Fullstack Developer',
    companyName: 'PT Astra International',
    senderName: 'Rizick Fimelyan',
    recipientName: 'Ibu Ratna',
  })
  assert.equal(
    substituted,
    'Melamar posisi Fullstack Developer di PT Astra International oleh Rizick Fimelyan kepada Ibu Ratna.'
  )
})


