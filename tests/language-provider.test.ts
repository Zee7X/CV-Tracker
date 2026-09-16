import assert from 'node:assert/strict'
import test from 'node:test'
import { translateText } from '../src/components/i18n/language-provider'

test('translates known UI copy and preserves surrounding whitespace', () => {
  assert.equal(translateText('  Sign In\n', 'id'), '  Masuk\n')
  assert.equal(translateText('Sign In', 'en'), 'Sign In')
  assert.equal(translateText('CV Tracker', 'id'), 'CV Tracker')
})
