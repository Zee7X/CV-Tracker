import assert from 'node:assert/strict'
import test from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { AtsTemplate } from '../src/components/cv/templates/ats'
import { ProfessionalTemplate } from '../src/components/cv/templates/professional'
import { ModernTemplate } from '../src/components/cv/templates/modern'
import { SAMPLE_CV } from '../src/components/cv/templates/sample-data'

// ponytail: class-string assertions only (no jsdom layout), matches the existing
// live-preview.test.tsx pattern. Upgrade to real viewport rendering if a browser
// test runner is added later.
const templates = [
  ['ats', AtsTemplate],
  ['professional', ProfessionalTemplate],
  ['modern', ModernTemplate],
] as const

for (const [name, Template] of templates) {
  test(`${name} template has no truncate class on user-content spans (must wrap, not clip)`, () => {
    const html = renderToStaticMarkup(<Template cv={SAMPLE_CV} />)
    assert.doesNotMatch(html, /class="[^"]*\btruncate\b/)
  })

  test(`${name} template wraps long unbroken strings instead of overflowing`, () => {
    const html = renderToStaticMarkup(<Template cv={SAMPLE_CV} />)
    assert.match(html, /break-words|break-all/)
  })
}
