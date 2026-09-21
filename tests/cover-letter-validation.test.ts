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

