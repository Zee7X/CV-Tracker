import React from 'react'
import type { CVWithRelations } from '@/types/cv'
import { formatDateRange, formatDisplayUrl, formatReadableDate, isEmptyCV } from './sample-data'

export interface TemplateProps {
  cv: CVWithRelations
  className?: string
}

/**
 * Professional Template
 * Corporate, refined aesthetic with rich navy/slate accents, structured hierarchy,
 * and pill-based skill tags suitable for corporate, finance, and executive positions.
 */
export function ProfessionalTemplate({ cv, className = '' }: TemplateProps) {
  const info = cv.personal_info || {}
  const experiences = [...(cv.experiences || [])].sort((a, b) => a.sort_order - b.sort_order)
  const educations = [...(cv.educations || [])].sort((a, b) => a.sort_order - b.sort_order)
  const projects = [...(cv.projects || [])].sort((a, b) => a.sort_order - b.sort_order)
  const certifications = [...(cv.certifications || [])].sort((a, b) => a.sort_order - b.sort_order)
  const skills = (cv.skills || []).filter(Boolean)

  if (isEmptyCV(cv)) {
    return (
      <article
        className={`w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white p-10 text-slate-900 font-sans shadow-sm print:shadow-none print:p-0 flex flex-col justify-center items-center text-center ${className}`}
        data-template="professional"
      >
        <div className="w-12 h-1 bg-blue-600 mb-4" />
        <h1 className="text-xl font-bold text-slate-800">Professional CV Preview</h1>
        <p className="mt-2 text-sm text-slate-500 max-w-sm">
          No CV details available. Enter your background to generate an executive-ready resume.
        </p>
      </article>
    )
  }

  // Contact list
  const contactLinks: { label: string; href?: string; icon?: string }[] = []
  if (info.email) contactLinks.push({ label: info.email, href: `mailto:${info.email}` })
  if (info.phone) contactLinks.push({ label: info.phone, href: `tel:${info.phone}` })
  if (info.location) contactLinks.push({ label: info.location })
  if (info.linkedin) contactLinks.push({ label: `LinkedIn: ${formatDisplayUrl(info.linkedin)}`, href: info.linkedin })
  if (info.github) contactLinks.push({ label: `GitHub: ${formatDisplayUrl(info.github)}`, href: info.github })
  if (info.portfolio) contactLinks.push({ label: formatDisplayUrl(info.portfolio), href: info.portfolio })

  return (
    <article
      className={`w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white text-slate-900 font-sans leading-normal wrap-break-word shadow-sm print:shadow-none print:p-0 ${className}`}
      data-template="professional"
    >
      {/* Top Banner Accent */}
      <div className="h-2.5 bg-linear-to-r from-blue-700 via-blue-800 to-slate-900 print:bg-blue-800" />

      <div className="p-8 md:p-10 space-y-6">
        {/* Header Section */}
        <header className="border-b border-slate-200 pb-5 break-inside-avoid print:break-inside-avoid">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-2">
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight text-slate-900 font-serif">
                {info.full_name || 'Candidate Name'}
              </h1>
              {info.professional_title && (
                <p className="text-sm md:text-base font-semibold text-blue-700 mt-0.5">
                  {info.professional_title}
                </p>
              )}
            </div>
          </div>

          {contactLinks.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2.5">
              {contactLinks.map((item, idx) => (
                <div key={idx} className="flex min-w-0 items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 select-none print:hidden shrink-0" />
                  {item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="min-w-0 break-all text-slate-700 hover:text-blue-700 hover:underline transition-colors"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span className="min-w-0 wrap-break-word">{item.label}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </header>

        <main className="space-y-6">
          {/* Executive Summary */}
          {cv.summary && (
            <section className="break-inside-avoid print:break-inside-avoid" aria-labelledby="prof-summary-heading">
              <h2
                id="prof-summary-heading"
                className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-blue-600 pb-1 mb-2.5"
              >
                <span className="w-2 h-2 bg-blue-600 rounded-sm" />
                Executive Summary
              </h2>
              <p className="text-xs md:text-sm text-slate-700 leading-relaxed text-justify">
                {cv.summary}
              </p>
            </section>
          )}

          {/* Work Experience */}
          {experiences.length > 0 && (
            <section className="space-y-4" aria-labelledby="prof-experience-heading">
              <h2
                id="prof-experience-heading"
                className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-blue-600 pb-1 mb-2.5"
              >
                <span className="w-2 h-2 bg-blue-600 rounded-sm" />
                Professional Experience
              </h2>
              <div className="space-y-4">
                {experiences.map((exp, idx) => (
                  <div
                    key={exp.id || idx}
                    className="border-l-2 border-slate-200 pl-3.5 ml-1 break-inside-avoid print:break-inside-avoid"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
                      <h3 className="min-w-0 flex-1 text-xs md:text-sm font-bold text-slate-900">
                        {exp.position}
                      </h3>
                      <span className="shrink-0 rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 print:bg-transparent sm:ml-4">
                        {formatDateRange(exp.start_date, exp.end_date, exp.is_current)}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-600 mt-0.5 flex flex-wrap gap-x-2">
                      <span className="min-w-0 wrap-break-word text-slate-800 font-semibold">{exp.company}</span>
                      {exp.location && <span>• {exp.location}</span>}
                    </div>
                    {exp.description && (
                      <p className="mt-1.5 text-xs md:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {educations.length > 0 && (
            <section className="space-y-3" aria-labelledby="prof-education-heading">
              <h2
                id="prof-education-heading"
                className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-blue-600 pb-1 mb-2.5"
              >
                <span className="w-2 h-2 bg-blue-600 rounded-sm" />
                Education
              </h2>
              <div className="space-y-3">
                {educations.map((edu, idx) => (
                  <div
                    key={edu.id || idx}
                    className="border-l-2 border-slate-200 pl-3.5 ml-1 break-inside-avoid print:break-inside-avoid"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
                      <h3 className="min-w-0 flex-1 text-xs md:text-sm font-bold text-slate-900">
                        {[edu.degree, edu.field_of_study].filter(Boolean).join(' in ') || edu.institution}
                      </h3>
                      <span className="shrink-0 text-xs font-medium text-slate-600 sm:ml-4">
                        {formatDateRange(edu.start_date, edu.end_date)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 font-medium">{edu.institution}</div>
                    {edu.description && (
                      <p className="mt-1 text-xs md:text-sm text-slate-600 leading-relaxed">
                        {edu.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Core Competencies / Skills */}
          {skills.length > 0 && (
            <section className="break-inside-avoid print:break-inside-avoid" aria-labelledby="prof-skills-heading">
              <h2
                id="prof-skills-heading"
                className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-blue-600 pb-1 mb-2.5"
              >
                <span className="w-2 h-2 bg-blue-600 rounded-sm" />
                Core Competencies & Skills
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200 print:border-slate-300 print:bg-transparent"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Key Projects */}
          {projects.length > 0 && (
            <section className="space-y-3" aria-labelledby="prof-projects-heading">
              <h2
                id="prof-projects-heading"
                className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-blue-600 pb-1 mb-2.5"
              >
                <span className="w-2 h-2 bg-blue-600 rounded-sm" />
                Key Projects & Initiatives
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {projects.map((proj, idx) => (
                  <div
                    key={proj.id || idx}
                    className="bg-slate-50/70 p-3 rounded-lg border border-slate-200/80 break-inside-avoid print:break-inside-avoid print:bg-transparent print:p-0 print:border-none"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
                      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                        <h3 className="min-w-0 text-xs md:text-sm font-bold text-slate-900">{proj.name}</h3>
                        {proj.project_url && (
                          <a
                            href={proj.project_url}
                            target="_blank"
                            rel="noreferrer"
                            className="break-all text-xs text-blue-700 hover:underline font-medium"
                          >
                            ↗ View Project
                          </a>
                        )}
                      </div>
                      {(proj.start_date || proj.end_date) && (
                        <span className="shrink-0 text-xs text-slate-600 sm:ml-4">
                          {formatDateRange(proj.start_date, proj.end_date)}
                        </span>
                      )}
                    </div>
                    {proj.description && (
                      <p className="mt-1 text-xs md:text-sm text-slate-700 leading-relaxed">
                        {proj.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications & Licenses */}
          {certifications.length > 0 && (
            <section className="space-y-2.5 break-inside-avoid print:break-inside-avoid" aria-labelledby="prof-certs-heading">
              <h2
                id="prof-certs-heading"
                className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-blue-600 pb-1 mb-2.5"
              >
                <span className="w-2 h-2 bg-blue-600 rounded-sm" />
                Certifications & Credentials
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {certifications.map((cert, idx) => (
                  <div
                    key={cert.id || idx}
                    className="p-2.5 rounded border border-slate-200 bg-white break-inside-avoid print:break-inside-avoid"
                  >
                    <div className="text-xs font-bold text-slate-900">{cert.name}</div>
                    {cert.issuer && <div className="text-xs text-slate-600">{cert.issuer}</div>}
                    <div className="flex justify-between items-center mt-1 text-xs text-slate-500">
                      {cert.issue_date && <span>Issued: {formatReadableDate(cert.issue_date)}</span>}
                      {cert.credential_url && (
                        <a
                          href={cert.credential_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-700 hover:underline font-medium ml-auto"
                        >
                          Verify ↗
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </article>
  )
}
