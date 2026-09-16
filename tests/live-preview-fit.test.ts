import assert from 'node:assert/strict'
import test from 'node:test'
import { computeFitScale } from '../src/components/cv/live-preview'

test('computeFitScale fits container width to A4 and clamps to 0.4..1.1', () => {
  // 360px phone minus 48px padding = 312px usable width; 312/794=0.39, clamped up to the 0.4 floor
  assert.equal(computeFitScale(312), 0.4)
  // 414px phone minus 48px padding = 366px usable width; 366/794=0.46, above the floor
  assert.equal(computeFitScale(366), 0.46)
  // Very narrow container clamps to the 0.4 floor
  assert.equal(computeFitScale(50), 0.4)
  // Very wide container clamps to the 1.1 ceiling
  assert.equal(computeFitScale(2000), 1.1)
  // Exact A4 width scales to 1
  assert.equal(computeFitScale(794), 1)
})
