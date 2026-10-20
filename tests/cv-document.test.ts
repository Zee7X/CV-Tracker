import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildCVDocument,
  formatDateRange,
  formatMonthYear,
  parseDescription,
  sortExperiences,
  toMonthValue,
  toStoredDate,
} from '../src/lib/cv/document'
import type { CVWithRelations, Experience } from '../src/types/cv'

const exp = (over: Partial<Experience>): Experience => ({
  id: over.company || 'x',
  cv_id: 'cv',
  company: 'Company',
  position: 'Role',
  location: undefined,
  start_date: '2024-01-01',
  end_date: null,
  is_current: false,
  description: undefined,
  sort_order: 0,
  ...over,
})

test('dates show month and year only, in the CV language', () => {
  assert.equal(formatMonthYear('2024-06-03', 'en'), 'Jun 2024')
  assert.equal(formatMonthYear('2024-08', 'id'), 'Agu 2024')
  assert.equal(formatMonthYear('2024-05-01', 'id'), 'Mei 2024')
  assert.equal(formatMonthYear('2024', 'en'), '2024')
  assert.equal(formatMonthYear('', 'en'), '')
})

test('date ranges use Present / Sekarang for current roles', () => {
  assert.equal(formatDateRange('2025-11-01', null, true, 'en'), 'Nov 2025 – Present')
  assert.equal(formatDateRange('2025-11-01', null, true, 'id'), 'Nov 2025 – Sekarang')
  assert.equal(formatDateRange('2024-06-03', '2025-10-31', false, 'en'), 'Jun 2024 – Oct 2025')
  assert.equal(formatDateRange('2024-06-01', '2024-06-30', false, 'en'), 'Jun 2024')
  assert.equal(formatDateRange(null, '2023-07-01', false, 'en'), 'Jul 2023')
})

test('experience is ordered current first, then newest start date, regardless of entry order', () => {
  const sorted = sortExperiences([
    exp({ company: 'Old', start_date: '2022-01-01', end_date: '2023-01-01', sort_order: 0 }),
    exp({ company: 'Mid', start_date: '2024-06-03', end_date: '2025-11-01', sort_order: 1 }),
    exp({ company: 'Now', start_date: '2025-11-03', is_current: true, sort_order: 2 }),
  ])
  assert.deepEqual(
    sorted.map((e) => e.company),
    ['Now', 'Mid', 'Old']
  )
})

test('dash, asterisk, bullet and numbered lines become list items', () => {
  assert.deepEqual(parseDescription('Built the platform.\n- Wrote APIs\n• Fixed bugs\n\n1. Shipped'), [
    { type: 'paragraph', text: 'Built the platform.' },
    { type: 'list', items: ['Wrote APIs', 'Fixed bugs', 'Shipped'] },
  ])
  assert.deepEqual(parseDescription('  '), [])
  // A hyphenated word is not a bullet
  assert.deepEqual(parseDescription('Full-stack work'), [{ type: 'paragraph', text: 'Full-stack work' }])
})

test('month inputs round-trip through the date column', () => {
  assert.equal(toMonthValue('2024-06-03'), '2024-06')
  assert.equal(toMonthValue(null), '')
  assert.equal(toStoredDate('2024-06'), '2024-06-01')
  assert.equal(toStoredDate('2024-06-03'), '2024-06-03')
  assert.equal(toStoredDate(''), null)
})

test('document uses its own language and puts skills right after the summary', () => {
  const cv = {
    id: 'cv',
    user_id: 'u',
    name: 'CV',
    template: 'ats',
    personal_info: { document_language: 'id', full_name: 'Nama', email: 'a@b.co' },
    summary: 'Ringkasan.',
    skills: ['Laravel', ' ', 'MySQL'],
    experiences: [exp({})],
    educations: [],
    projects: [],
    certifications: [],
    created_at: '',
    updated_at: '',
  } as unknown as CVWithRelations

  const doc = buildCVDocument(cv)
  assert.equal(doc.language, 'id')
  assert.equal(doc.labels.experience, 'Pengalaman Kerja')
  assert.deepEqual(doc.skills, ['Laravel', 'MySQL'])
  assert.deepEqual(doc.sections, ['summary', 'skills', 'experience'])

  // Older CVs saved before the language setting existed default to English.
  const legacy = buildCVDocument({ ...cv, personal_info: { full_name: 'N', email: 'a@b.co' } } as CVWithRelations)
  assert.equal(legacy.language, 'en')
  assert.equal(legacy.labels.present, 'Present')
})
