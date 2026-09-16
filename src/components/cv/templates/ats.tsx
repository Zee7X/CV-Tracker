import React from 'react'
import type { CVWithRelations } from '@/types/cv'
import { formatDateRange, formatDisplayUrl, isEmptyCV } from './sample-data'

export interface TemplateProps {
  cv: CVWithRelations
  className?: string
}

/**
 * ATS Template
 * High-parseability single-column layout optimized for Applicant Tracking Systems.
 * Standard semantic headings, linear chronological flows, and monochrome high-contrast typography.
 */
export function AtsTemplate({ cv, className = '' }: TemplateProps) {
  const info = cv.personal_info || {}
  const experiences = [...(cv.experiences || [])].sort((a, b) => a.sort_order - b.sort_order)
  const educations = [...(cv.educations || [])].sort((a, b) => a.sort_order - b.sort_order)
  const projects = [...(cv.projects || [])].sort((a, b) => a.sort_order - b.sort_order)
  const certifications = [...(cv.certifications || [])].sort((a, b) => a.sort_order - b.sort_order)
  const skills = (cv.skills || []).filter(Boolean)

  if (isEmptyCV(cv)) {
    return (
      <article
        className={`w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white p-10 text-neutral-900 font-sans shadow-sm print:shadow-none print:p-0 flex flex-col justify-center items-center text-center ${className}`}
        data-template="ats"
      >
        <h1 className="text-xl font-bold uppercase tracking-wider text-neutral-400">Empty ATS Resume</h1>
        <p className="mt-2 text-sm text-neutral-500 max-w-sm">
          No CV information provided yet. Fill in your personal details, work history, and skills to generate your ATS-compliant resume.
        </p>
      </article>
    )
  }

  // Build contact items array
  const contactItems: { label: string; href?: string }[] = []
  if (info.phone) contactItems.push({ label: info.phone, href: `tel:${info.phone}` })
  if (info.email) contactItems.push({ label: info.email, href: `mailto:${info.email}` })
  if (info.location) contactItems.push({ label: info.location })
  if (info.linkedin) contactItems.push({ label: `LinkedIn: ${formatDisplayUrl(info.linkedin)}`, href: info.linkedin })
  if (info.github) contactItems.push({ label: `GitHub: ${formatDisplayUrl(info.github)}`, href: info.github })
  if (info.portfolio) contactItems.push({ label: formatDisplayUrl(info.portfolio), href: info.portfolio })

  return (
    <article
      className={`w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white p-8 md:p-10 text-neutral-900 font-sans leading-normal break-words shadow-sm print:shadow-none print:p-0 ${className}`}
      data-template="ats"
    >
      {/* Header */}
      <header className="border-b border-neutral-900 pb-3 mb-5 text-center break-inside-avoid print:break-inside-avoid">
        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wide leading-tight text-neutral-950">
          {info.full_name || 'Unnamed Candidate'}
        </h1>
        {info.professional_title && (
          <p className="text-sm md:text-base font-medium text-neutral-700 mt-1 uppercase tracking-wider">
            {info.professional_title}
          </p>
        )}
        {contactItems.length > 0 && (
          <div className="mt-2 text-xs md:text-sm text-neutral-700 flex flex-wrap justify-center items-center gap-x-2 gap-y-1">
            {contactItems.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-neutral-400 select-none">•</span>}
                {item.href ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all hover:underline focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span>{item.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </header>

      <main className="space-y-5">
        {/* Professional Summary */}
        {cv.summary && (
          <section className="break-inside-avoid print:break-inside-avoid" aria-labelledby="ats-summary-heading">
            <h2
              id="ats-summary-heading"
              className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-400 pb-1 mb-2"
            >
              Professional Summary
            </h2>
            <p className="text-xs md:text-sm text-neutral-800 leading-relaxed text-justify">
              {cv.summary}
            </p>
          </section>
        )}

        {/* Experience Section */}
        {experiences.length > 0 && (
          <section className="space-y-3" aria-labelledby="ats-experience-heading">
            <h2
              id="ats-experience-heading"
              className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-400 pb-1 mb-2"
            >
              Professional Experience
            </h2>
            <div className="space-y-4">
              {experiences.map((exp, idx) => (
                <div key={exp.id || idx} className="break-inside-avoid print:break-inside-avoid">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
                    <h3 className="min-w-0 flex-1 text-xs md:text-sm font-bold text-neutral-950">
                      {exp.position}
                    </h3>
                    <span className="shrink-0 text-xs font-medium text-neutral-700 sm:ml-4">
                      {formatDateRange(exp.start_date, exp.end_date, exp.is_current)}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline text-xs text-neutral-700 italic">
                    <span className="min-w-0 flex-1">{exp.company}</span>
                    {exp.location && <span className="shrink-0 sm:ml-4">{exp.location}</span>}
                  </div>
                  {exp.description && (
                    <p className="mt-1.5 text-xs md:text-sm text-neutral-800 leading-relaxed whitespace-pre-line">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education Section */}
        {educations.length > 0 && (
          <section className="space-y-3" aria-labelledby="ats-education-heading">
            <h2
              id="ats-education-heading"
              className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-400 pb-1 mb-2"
            >
              Education
            </h2>
            <div className="space-y-3">
              {educations.map((edu, idx) => (
                <div key={edu.id || idx} className="break-inside-avoid print:break-inside-avoid">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
                    <h3 className="min-w-0 flex-1 text-xs md:text-sm font-bold text-neutral-950">
                      {[edu.degree, edu.field_of_study].filter(Boolean).join(', ') || edu.institution}
                    </h3>
                    <span className="shrink-0 text-xs font-medium text-neutral-700 sm:ml-4">
                      {formatDateRange(edu.start_date, edu.end_date)}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-700 italic">{edu.institution}</div>
                  {edu.description && (
                    <p className="mt-1 text-xs md:text-sm text-neutral-800 leading-relaxed">
                      {edu.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills Section */}
        {skills.length > 0 && (
          <section className="break-inside-avoid print:break-inside-avoid" aria-labelledby="ats-skills-heading">
            <h2
              id="ats-skills-heading"
              className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-400 pb-1 mb-2"
            >
              Skills & Proficiencies
            </h2>
            <p className="text-xs md:text-sm text-neutral-800 leading-relaxed">
              {skills.join(' • ')}
            </p>
          </section>
        )}

        {/* Projects Section */}
        {projects.length > 0 && (
          <section className="space-y-3" aria-labelledby="ats-projects-heading">
            <h2
              id="ats-projects-heading"
              className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-400 pb-1 mb-2"
            >
              Key Projects
            </h2>
            <div className="space-y-3">
              {projects.map((proj, idx) => (
                <div key={proj.id || idx} className="break-inside-avoid print:break-inside-avoid">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                      <h3 className="text-xs md:text-sm font-bold text-neutral-950">{proj.name}</h3>
                      {proj.project_url && (
                        <a
                          href={proj.project_url}
                          target="_blank"
                          rel="noreferrer"
                          className="break-all text-xs text-neutral-600 hover:underline"
                        >
                          [{formatDisplayUrl(proj.project_url)}]
                        </a>
                      )}
                    </div>
                    {(proj.start_date || proj.end_date) && (
                      <span className="shrink-0 text-xs text-neutral-700 sm:ml-4">
                        {formatDateRange(proj.start_date, proj.end_date)}
                      </span>
                    )}
                  </div>
                  {proj.description && (
                    <p className="mt-1 text-xs md:text-sm text-neutral-800 leading-relaxed">
                      {proj.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications Section */}
        {certifications.length > 0 && (
          <section className="break-inside-avoid print:break-inside-avoid" aria-labelledby="ats-certifications-heading">
            <h2
              id="ats-certifications-heading"
              className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-400 pb-1 mb-2"
            >
              Certifications
            </h2>
            <div className="space-y-2">
              {certifications.map((cert, idx) => (
                <div key={cert.id || idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline break-inside-avoid print:break-inside-avoid">
                  <div className="min-w-0 flex-1">
                    <span className="text-xs md:text-sm font-bold text-neutral-950">{cert.name}</span>
                    {cert.issuer && <span className="text-xs text-neutral-700"> — {cert.issuer}</span>}
                    {cert.credential_url && (
                      <a
                        href={cert.credential_url}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-2 text-xs text-neutral-600 hover:underline"
                      >
                        [Verify]
                      </a>
                    )}
                  </div>
                  {cert.issue_date && (
                    <span className="shrink-0 text-xs text-neutral-700 sm:ml-4">{cert.issue_date}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </article>
  )
}
