import React from 'react'
import type { CVWithRelations, DocumentLanguage } from '@/types/cv'
import {
  buildCVDocument,
  educationHeading,
  formatDateRange,
  formatDisplayUrl,
  formatMonthYear,
  type SectionKey,
} from '@/lib/cv/document'
import { Description, Sheet } from './parts'

export interface TemplateProps {
  cv: CVWithRelations
  language?: DocumentLanguage
  className?: string
}

/**
 * ATS Clean: one column, plain headings, no graphics, no tables.
 * Every line reads top to bottom so applicant tracking parsers keep the order.
 */
export function AtsTemplate({ cv, language, className = '' }: TemplateProps) {
  const doc = buildCVDocument(cv, { language, template: 'ats' })
  const { labels } = doc

  const heading = (id: string, text: string) => (
    <h2
      id={id}
      className="mb-2 border-b border-neutral-800 pb-0.5 text-[11.5px] font-bold uppercase tracking-[0.06em] text-neutral-950"
    >
      {text}
    </h2>
  )

  const sections: Record<SectionKey, React.ReactNode> = {
    summary: (
      <section aria-labelledby="ats-summary">
        {heading('ats-summary', labels.summary)}
        <p className="leading-[1.5]">{doc.summary}</p>
      </section>
    ),
    skills: (
      <section aria-labelledby="ats-skills">
        {heading('ats-skills', labels.skills)}
        <p className="leading-[1.5]">{doc.skills.join(', ')}</p>
      </section>
    ),
    experience: (
      <section aria-labelledby="ats-experience">
        {heading('ats-experience', labels.experience)}
        <div className="space-y-3">
          {doc.experiences.map((exp, idx) => (
            <div key={exp.id || idx} className="break-inside-avoid">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="min-w-0 font-bold text-neutral-950">{exp.position}</h3>
                <span className="shrink-0 tabular-nums">
                  {formatDateRange(exp.start_date, exp.end_date, exp.is_current, doc.language)}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <span className="min-w-0 wrap-break-word">{exp.company}</span>
                {exp.location ? <span className="shrink-0 text-neutral-700">{exp.location}</span> : null}
              </div>
              <Description text={exp.description} className="mt-1 leading-[1.45]" />
            </div>
          ))}
        </div>
      </section>
    ),
    projects: (
      <section aria-labelledby="ats-projects">
        {heading('ats-projects', labels.projects)}
        <div className="space-y-2.5">
          {doc.projects.map((proj, idx) => (
            <div key={proj.id || idx} className="break-inside-avoid">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="min-w-0 font-bold text-neutral-950">{proj.name}</h3>
                <span className="shrink-0 tabular-nums">
                  {formatDateRange(proj.start_date, proj.end_date, false, doc.language)}
                </span>
              </div>
              {proj.project_url ? (
                <a href={proj.project_url} target="_blank" rel="noreferrer" className="break-all text-neutral-700 hover:underline">
                  {formatDisplayUrl(proj.project_url)}
                </a>
              ) : null}
              <Description text={proj.description} className="mt-1 leading-[1.45]" />
            </div>
          ))}
        </div>
      </section>
    ),
    education: (
      <section aria-labelledby="ats-education">
        {heading('ats-education', labels.education)}
        <div className="space-y-2.5">
          {doc.educations.map((edu, idx) => (
            <div key={edu.id || idx} className="break-inside-avoid">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="min-w-0 font-bold text-neutral-950">{edu.institution}</h3>
                <span className="shrink-0 tabular-nums">
                  {formatDateRange(edu.start_date, edu.end_date, false, doc.language)}
                </span>
              </div>
              {educationHeading(edu) ? <div>{educationHeading(edu)}</div> : null}
              <Description text={edu.description} className="mt-0.5 leading-[1.45]" />
            </div>
          ))}
        </div>
      </section>
    ),
    certifications: (
      <section aria-labelledby="ats-certifications">
        {heading('ats-certifications', labels.certifications)}
        <ul className="space-y-1">
          {doc.certifications.map((cert, idx) => (
            <li key={cert.id || idx} className="flex items-baseline justify-between gap-4 break-inside-avoid">
              <span className="min-w-0 wrap-break-word">
                <span className="font-bold text-neutral-950">{cert.name}</span>
                {cert.issuer ? <span>, {cert.issuer}</span> : null}
                {cert.credential_url ? (
                  <>
                    {' '}
                    (
                    <a href={cert.credential_url} target="_blank" rel="noreferrer" className="hover:underline">
                      {labels.credential}
                    </a>
                    )
                  </>
                ) : null}
              </span>
              {cert.issue_date ? (
                <span className="shrink-0 tabular-nums">{formatMonthYear(cert.issue_date, doc.language)}</span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    ),
  }

  return (
    <Sheet
      template="ats"
      className={`px-[18mm] py-[16mm] font-[Arial,Helvetica,sans-serif] text-[12px] leading-snug text-neutral-800 ${className}`}
    >
      <header className="mb-4">
        <h1 className="text-[24px] font-bold leading-tight text-neutral-950">{doc.name}</h1>
        {doc.title ? <p className="mt-0.5 text-[13px] text-neutral-800">{doc.title}</p> : null}
        {doc.contacts.length > 0 ? (
          <p className="mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5 text-[11.5px] text-neutral-700">
            {doc.contacts.map((item, idx) => (
              <React.Fragment key={item.key}>
                {idx > 0 ? <span aria-hidden="true">|</span> : null}
                {item.href ? (
                  <a href={item.href} target="_blank" rel="noreferrer" className="break-all hover:underline">
                    {item.value}
                  </a>
                ) : (
                  <span className="wrap-break-word">{item.value}</span>
                )}
              </React.Fragment>
            ))}
          </p>
        ) : null}
      </header>

      <div className="space-y-4">
        {doc.sections.map((key) => (
          <React.Fragment key={key}>{sections[key]}</React.Fragment>
        ))}
      </div>
    </Sheet>
  )
}
