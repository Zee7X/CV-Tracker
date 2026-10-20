import React from 'react'
import { parseDescription } from '@/lib/cv/document'

/**
 * Renders free-text descriptions: lines starting with "-", "*", "•" or "1."
 * become a real list, everything else a paragraph.
 */
export function Description({
  text,
  className = '',
  listClassName = '',
}: {
  text?: string | null
  className?: string
  listClassName?: string
}) {
  const blocks = parseDescription(text)
  if (blocks.length === 0) return null
  return (
    <div className={`space-y-1 ${className}`}>
      {blocks.map((block, idx) =>
        block.type === 'list' ? (
          <ul key={idx} className={`list-disc space-y-0.5 pl-[1.1em] marker:text-current ${listClassName}`}>
            {block.items.map((item, itemIdx) => (
              <li key={itemIdx} className="wrap-break-word pl-0.5">
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p key={idx} className="wrap-break-word">
            {block.text}
          </p>
        )
      )}
    </div>
  )
}

/** Stable A4 sheet. Width is fixed; the live preview scales the whole sheet instead of reflowing it. */
export function Sheet({
  template,
  className = '',
  children,
}: {
  template: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <article
      data-template={template}
      data-no-translate
      className={`mx-auto min-h-[297mm] w-[210mm] max-w-full bg-white wrap-break-word text-left print:min-h-0 print:w-full ${className}`}
    >
      {children}
    </article>
  )
}
