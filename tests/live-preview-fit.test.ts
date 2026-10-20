import assert from 'node:assert/strict'
import test from 'node:test'
import { computeFitScale } from '../src/components/cv/live-preview'

test('computeFitScale fits container width to A4 and clamps to 0.3..1.1', () => {
  // Rounds down so the scaled sheet never overflows its container
  assert.equal(computeFitScale(312), 0.39)
  assert.equal(computeFitScale(366), 0.46)
  // Very narrow container clamps to the 0.3 floor
  assert.equal(computeFitScale(50), 0.3)
  // Very wide container clamps to the 1.1 ceiling
  assert.equal(computeFitScale(2000), 1.1)
  // Exact A4 width scales to 1
  assert.equal(computeFitScale(794), 1)
})
