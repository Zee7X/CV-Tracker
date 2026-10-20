import React from 'react'
import type { CVWithRelations, DocumentLanguage } from '@/types/cv'
import {
  buildCVDocument,
  educationHeading,
  formatDateRange,
  formatDisplayUrl,
  formatMonthYear,
} from '@/lib/cv/document'
import { Description, Sheet } from './parts'

export interface TemplateProps {
  cv: CVWithRelations
  language?: DocumentLanguage
  className?: string
}

const ACCENT = 'text-[#155e63]'

/**
 * Modern: two columns. A light sidebar holds reference facts (contact,
 * skills, education, certifications); the main column holds the story
 * (summary, experience, projects). Light sidebar so it prints cleanly.
 */
export function ModernTemplate({ cv, language, className = '' }: TemplateProps) {
  const doc = buildCVDocument(cv, { language, template: 'modern' })
  const { labels } = doc
  const has = (key: (typeof doc.sections)[number]) => doc.sections.includes(key)

  const sideHeading = (text: string) => (
    <h2 className={`mb-1.5 text-[10px] font-bold uppercase tracking-[0.1em] ${ACCENT}`}>{text}</h2>
  )
  const mainHeading = (text: string) => (
    <h2 className={`mb-2 border-b border-slate-200 pb-1 text-[11px] font-bold uppercase tracking-[0.1em] ${ACCENT}`}>
      {text}
    </h2>
  )

  return (
    <Sheet
      template="modern"
      className={`grid grid-cols-[64mm_1fr] font-[Helvetica,Arial,sans-serif] text-[11.5px] leading-snug text-slate-800 ${className}`}
    >
      <aside className="space-y-5 bg-[#eef3f3] px-[7mm] py-[14mm] print:bg-[#eef3f3]">
        {doc.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={doc.photoUrl} alt={doc.name} className="h-[30mm] w-[30mm] rounded-md object-cover" />
        ) : null}

        {doc.contacts.length > 0 ? (
          <section aria-label={labels.contact}>
            {sideHeading(labels.contact)}
            <dl className="space-y-1.5 text-[11px]">
              {doc.contacts.map((item) => (
                <div key={item.key}>
                  <dt className="text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">{item.label}</dt>
                  <dd className="break-all text-slate-800">
                    {item.href ? (
                      <a href={item.href} target="_blank" rel="noreferrer" className="hover:underline">
                        {item.value}
                      </a>
                    ) : (
                      item.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {has('skills') ? (
          <section aria-label={labels.skills}>
            {sideHeading(labels.skills)}
            <ul className="space-y-0.5 text-[11px]">
              {doc.skills.map((skill) => (
                <li key={skill} className="wrap-break-word">
                  {skill}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {has('education') ? (
          <section aria-label={labels.education}>
            {sideHeading(labels.education)}
            <div className="space-y-2.5 text-[11px]">
              {doc.educations.map((edu, idx) => (
                <div key={edu.id || idx} className="break-inside-avoid">
                  <p className="font-bold text-slate-950">{edu.institution}</p>
                  {educationHeading(edu) ? <p>{educationHeading(edu)}</p> : null}
                  <p className="text-slate-500">{formatDateRange(edu.start_date, edu.end_date, false, doc.language)}</p>
                  <Description text={edu.description} className="mt-0.5 text-slate-700" />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {has('certifications') ? (
          <section aria-label={labels.certifications}>
            {sideHeading(labels.certifications)}
            <div className="space-y-2 text-[11px]">
              {doc.certifications.map((cert, idx) => (
                <div key={cert.id || idx} className="break-inside-avoid">
                  {cert.credential_url ? (
                    <a href={cert.credential_url} target="_blank" rel="noreferrer" className="font-semibold text-slate-950 hover:underline">
                      {cert.name}
                    </a>
                  ) : (
                    <p className="font-semibold text-slate-950">{cert.name}</p>
                  )}
                  <p className="text-slate-500">
                    {[cert.issuer, formatMonthYear(cert.issue_date, doc.language)].filter(Boolean).join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </aside>

      <div className="min-w-0 space-y-5 px-[9mm] py-[14mm]">
        <header>
          <h1 className="text-[27px] font-bold leading-tight text-slate-950">{doc.name}</h1>
          {doc.title ? <p className={`mt-1 text-[13.5px] font-semibold ${ACCENT}`}>{doc.title}</p> : null}
        </header>

        {has('summary') ? (
          <section aria-label={labels.summary}>
            {mainHeading(labels.summary)}
            <p className="leading-[1.55]">{doc.summary}</p>
          </section>
        ) : null}

        {has('experience') ? (
          <section aria-label={labels.experience}>
            {mainHeading(labels.experience)}
            <div className="space-y-3.5">
              {doc.experiences.map((exp, idx) => (
                <div key={exp.id || idx} className="break-inside-avoid">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="min-w-0 font-bold text-slate-950">{exp.position}</h3>
                    <span className="shrink-0 text-[11px] tabular-nums text-slate-500">
                      {formatDateRange(exp.start_date, exp.end_date, exp.is_current, doc.language)}
                    </span>
                  </div>
                  <p className="text-slate-700">
                    <span className="font-semibold">{exp.company}</span>
                    {exp.location ? <span>, {exp.location}</span> : null}
                  </p>
                  <Description text={exp.description} className="mt-1 leading-[1.5]" />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {has('projects') ? (
          <section aria-label={labels.projects}>
            {mainHeading(labels.projects)}
            <div className="space-y-3">
              {doc.projects.map((proj, idx) => (
                <div key={proj.id || idx} className="break-inside-avoid">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="min-w-0 font-bold text-slate-950">{proj.name}</h3>
                    <span className="shrink-0 text-[11px] tabular-nums text-slate-500">
                      {formatDateRange(proj.start_date, proj.end_date, false, doc.language)}
                    </span>
                  </div>
                  {proj.project_url ? (
                    <a href={proj.project_url} target="_blank" rel="noreferrer" className={`break-all text-[11px] hover:underline ${ACCENT}`}>
                      {formatDisplayUrl(proj.project_url)}
                    </a>
                  ) : null}
                  <Description text={proj.description} className="mt-1 leading-[1.5]" />
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </Sheet>
  )
}
