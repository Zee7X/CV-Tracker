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
