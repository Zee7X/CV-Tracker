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
 * Professional: classic résumé with a label column. Section names sit in a
 * narrow left column so the reader scans headings and content separately.
 * One navy accent, serif name, no graphics.
 */
export function ProfessionalTemplate({ cv, language, className = '' }: TemplateProps) {
  const doc = buildCVDocument(cv, { language, template: 'professional' })
  const { labels } = doc

  const row = (key: string, label: string, content: React.ReactNode) => (
    <section key={key} aria-label={label} className="grid grid-cols-[34mm_1fr] gap-x-[6mm] border-t border-slate-300 pt-3">
      <h2 className="pt-px text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#1f3a5f]">{label}</h2>
      <div className="min-w-0">{content}</div>
    </section>
  )

  const sections: Record<SectionKey, React.ReactNode> = {
    summary: row('summary', labels.summary, <p className="leading-[1.55]">{doc.summary}</p>),
    skills: row('skills', labels.skills, <p className="leading-[1.55]">{doc.skills.join(' · ')}</p>),
    experience: row(
      'experience',
      labels.experience,
      <div className="space-y-3.5">
        {doc.experiences.map((exp, idx) => (
          <div key={exp.id || idx} className="break-inside-avoid">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="min-w-0 font-bold text-slate-950">{exp.position}</h3>
              <span className="shrink-0 text-[11px] tabular-nums text-slate-600">
                {formatDateRange(exp.start_date, exp.end_date, exp.is_current, doc.language)}
              </span>
            </div>
            <p className="text-slate-700">
              <span className="font-semibold text-[#1f3a5f]">{exp.company}</span>
              {exp.location ? <span>, {exp.location}</span> : null}
            </p>
            <Description text={exp.description} className="mt-1 leading-[1.5]" />
          </div>
        ))}
      </div>
    ),
    projects: row(
      'projects',
      labels.projects,
      <div className="space-y-3">
        {doc.projects.map((proj, idx) => (
          <div key={proj.id || idx} className="break-inside-avoid">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="min-w-0 font-bold text-slate-950">{proj.name}</h3>
              <span className="shrink-0 text-[11px] tabular-nums text-slate-600">
                {formatDateRange(proj.start_date, proj.end_date, false, doc.language)}
              </span>
            </div>
            {proj.project_url ? (
              <a href={proj.project_url} target="_blank" rel="noreferrer" className="break-all text-[11px] text-[#1f3a5f] hover:underline">
                {formatDisplayUrl(proj.project_url)}
              </a>
            ) : null}
            <Description text={proj.description} className="mt-1 leading-[1.5]" />
          </div>
        ))}
      </div>
    ),
    education: row(
      'education',
      labels.education,
      <div className="space-y-2.5">
        {doc.educations.map((edu, idx) => (
          <div key={edu.id || idx} className="break-inside-avoid">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="min-w-0 font-bold text-slate-950">{edu.institution}</h3>
              <span className="shrink-0 text-[11px] tabular-nums text-slate-600">
                {formatDateRange(edu.start_date, edu.end_date, false, doc.language)}
              </span>
            </div>
            {educationHeading(edu) ? <p className="text-slate-700">{educationHeading(edu)}</p> : null}
            <Description text={edu.description} className="mt-0.5 leading-[1.5]" />
          </div>
        ))}
      </div>
    ),
    certifications: row(
      'certifications',
      labels.certifications,
      <ul className="space-y-1">
        {doc.certifications.map((cert, idx) => (
          <li key={cert.id || idx} className="flex items-baseline justify-between gap-4 break-inside-avoid">
            <span className="min-w-0">
              {cert.credential_url ? (
                <a href={cert.credential_url} target="_blank" rel="noreferrer" className="font-semibold text-slate-950 hover:underline">
                  {cert.name}
                </a>
              ) : (
                <span className="font-semibold text-slate-950">{cert.name}</span>
              )}
              {cert.issuer ? <span className="text-slate-700">, {cert.issuer}</span> : null}
            </span>
            {cert.issue_date ? (
              <span className="shrink-0 text-[11px] tabular-nums text-slate-600">
                {formatMonthYear(cert.issue_date, doc.language)}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    ),
  }

  return (
    <Sheet
      template="professional"
      className={`px-[17mm] py-[15mm] font-[Helvetica,Arial,sans-serif] text-[11.5px] leading-snug text-slate-800 ${className}`}
    >
      <header className="mb-4 flex items-end justify-between gap-6 border-b-2 border-[#1f3a5f] pb-3">
        <div className="min-w-0">
          <h1 className="font-[Times_New_Roman,Times,serif] text-[28px] font-bold leading-none text-slate-950">{doc.name}</h1>
          {doc.title ? <p className="mt-1.5 text-[13px] font-semibold text-[#1f3a5f]">{doc.title}</p> : null}
        </div>
        {doc.contacts.length > 0 ? (
          <ul className="shrink-0 space-y-0.5 text-right text-[11px] text-slate-700">
            {doc.contacts.map((item) => (
              <li key={item.key} className="max-w-[70mm] break-all">
                {item.href ? (
                  <a href={item.href} target="_blank" rel="noreferrer" className="hover:underline">
                    {item.value}
                  </a>
                ) : (
                  item.value
                )}
              </li>
            ))}
          </ul>
        ) : null}
      </header>

      <div className="space-y-3">{doc.sections.map((key) => sections[key])}</div>
    </Sheet>
  )
}
