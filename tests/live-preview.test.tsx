import assert from 'node:assert/strict'
import test from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { LivePreview } from '../src/components/cv/live-preview'
import { EMPTY_CV } from '../src/components/cv/templates'

test('shows a useful sample instead of a blank page for an empty CV', () => {
  const html = renderToStaticMarkup(
    <LivePreview cv={EMPTY_CV} showControls={false} />
  )

  assert.match(html, /Nadia Putri/)
  assert.match(html, /sample data/i)
})
