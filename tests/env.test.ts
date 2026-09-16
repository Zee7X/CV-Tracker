import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveSupabasePublicKey } from '../src/lib/env'

test('uses the current Supabase publishable key with anon-key fallback', () => {
  assert.equal(resolveSupabasePublicKey('publishable', 'anon'), 'publishable')
  assert.equal(resolveSupabasePublicKey(undefined, 'anon'), 'anon')
  assert.equal(resolveSupabasePublicKey(undefined, undefined), '')
})
