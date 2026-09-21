import assert from 'node:assert/strict'
import test from 'node:test'
import { SAMPLE_CV } from '../src/components/cv/templates/sample-data'
import { cvSchema } from '../src/lib/validations/cv'

test('accepts a complete CV for any profession', () => {
  assert.equal(cvSchema.safeParse(SAMPLE_CV).success, true)
})

test('rejects placeholder text, fake social URLs, and reversed dates', () => {
  const cv = structuredClone(SAMPLE_CV)
  cv.personal_info.full_name = 'TEST'
  cv.personal_info.linkedin = 'https://linkedin'
  cv.summary = 'sadsadsadsadsad'
  cv.projects[0].start_date = '2026-09-17'
  cv.projects[0].end_date = '2026-09-16'

  const result = cvSchema.safeParse(cv)
  assert.equal(result.success, false)
  if (result.success) return

  const paths = result.error.issues.map((issue) => issue.path.join('.'))
  assert.ok(paths.includes('personal_info.full_name'))
  assert.ok(paths.includes('personal_info.linkedin'))
  assert.ok(paths.includes('summary'))
  assert.ok(paths.includes('projects.0.end_date'))
})

test('accepts technical short skills and acronyms without false-positive filler rejection', () => {
  const cv = structuredClone(SAMPLE_CV)
  cv.skills = ['PHP', 'MySQL', 'Git', 'SQL', 'CSS', 'HTML', 'Java', 'UI/UX', 'CI/CD', 'API', 'C++', 'Go', 'R']
  const result = cvSchema.safeParse(cv)
  assert.equal(result.success, true)
})

test('allows current experience with empty end_date without error', () => {
  const cv = structuredClone(SAMPLE_CV)
  cv.experiences[0].is_current = true
  cv.experiences[0].end_date = null
  const result = cvSchema.safeParse(cv)
  assert.equal(result.success, true)
})

test('accepts photo_url with base64 data URL or web URL', () => {
  const cvWithDataUrl = structuredClone(SAMPLE_CV)
  cvWithDataUrl.personal_info.photo_url = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD'
  assert.equal(cvSchema.safeParse(cvWithDataUrl).success, true)

  const cvWithWebUrl = structuredClone(SAMPLE_CV)
  cvWithWebUrl.personal_info.photo_url = 'https://example.com/photo.jpg'
  assert.equal(cvSchema.safeParse(cvWithWebUrl).success, true)

  const cvWithInvalidPhoto = structuredClone(SAMPLE_CV)
  cvWithInvalidPhoto.personal_info.photo_url = 'not-a-valid-url-or-data'
  assert.equal(cvSchema.safeParse(cvWithInvalidPhoto).success, false)
})

