import React from 'react'
import type { CVWithRelations } from '@/types/cv'
import { formatDateRange, formatDisplayUrl, formatReadableDate, isEmptyCV } from './sample-data'

export interface TemplateProps {
  cv: CVWithRelations
  className?: string
}

/**
 * Modern Template
 * Asymmetrical 2-column layout with high-impact dark sidebar, timeline nodes for experience,
 * photo support, and modern typography for portfolio-based and client-facing roles.
 */
export function ModernTemplate({ cv, className = '' }: TemplateProps) {
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
        data-template="modern"
      >
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
          M
        </div>
        <h1 className="text-xl font-bold text-slate-900">Modern CV Template</h1>
        <p className="mt-2 text-sm text-slate-500 max-w-sm">
          No CV content provided yet. Fill out your profile to view your modern two-column CV.
        </p>
      </article>
    )
  }

  // Sidebar contact items
  const contactItems: { label: string; value: string; href?: string }[] = []
  if (info.email) contactItems.push({ label: 'Email', value: info.email, href: `mailto:${info.email}` })
  if (info.phone) contactItems.push({ label: 'Phone', value: info.phone, href: `tel:${info.phone}` })
  if (info.location) contactItems.push({ label: 'Location', value: info.location })
  if (info.linkedin) contactItems.push({ label: 'LinkedIn', value: formatDisplayUrl(info.linkedin), href: info.linkedin })
  if (info.github) contactItems.push({ label: 'GitHub', value: formatDisplayUrl(info.github), href: info.github })
  if (info.portfolio) contactItems.push({ label: 'Portfolio', value: formatDisplayUrl(info.portfolio), href: info.portfolio })

  return (
    <article
      className={`w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white text-slate-900 font-sans wrap-break-word shadow-sm print:shadow-none flex flex-col md:flex-row ${className}`}
      data-template="modern"
    >
      {/* Left Sidebar (~35% width) */}
      <aside className="w-full md:w-[35%] bg-slate-900 text-slate-100 p-6 md:p-7 space-y-6 print:bg-slate-900 print:text-slate-100">
        {/* Profile Photo if available */}
        {info.photo_url && (
          <div className="flex justify-center break-inside-avoid print:break-inside-avoid">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={info.photo_url}
              alt={info.full_name || 'Candidate profile'}
              className="h-24 w-24 rounded-2xl object-cover ring-2 ring-blue-500 shadow-md md:h-28 md:w-28"
            />
          </div>
        )}

        {/* Contact Info */}
        {contactItems.length > 0 && (
          <div className="space-y-2.5 break-inside-avoid print:break-inside-avoid" aria-label="Contact Information">
            <h2 className="border-b border-slate-700 pb-1 text-xs font-bold uppercase tracking-widest text-blue-300">
              Contact
            </h2>
            <div className="space-y-2 text-xs">
              {contactItems.map((item, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
                    {item.label}
                  </span>
                  {item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="break-all text-slate-200 transition-colors hover:text-blue-300 hover:underline"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <span className="text-slate-200 wrap-break-word">{item.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education (Sidebar location for modern balance) */}
        {educations.length > 0 && (
          <div className="space-y-3 break-inside-avoid print:break-inside-avoid" aria-label="Education">
            <h2 className="border-b border-slate-700 pb-1 text-xs font-bold uppercase tracking-widest text-blue-300">
              Education
            </h2>
            <div className="space-y-3 text-xs">
              {educations.map((edu, idx) => (
                <div key={edu.id || idx} className="space-y-0.5">
                  <div className="font-bold text-slate-100">
                    {[edu.degree, edu.field_of_study].filter(Boolean).join(', ') || edu.institution}
                  </div>
                  <div className="text-slate-300">{edu.institution}</div>
                  <div className="text-[11px] text-blue-300">
                    {formatDateRange(edu.start_date, edu.end_date)}
                  </div>
                  {edu.description && (
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                      {edu.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="space-y-2.5 break-inside-avoid print:break-inside-avoid" aria-label="Skills">
            <h2 className="border-b border-slate-700 pb-1 text-xs font-bold uppercase tracking-widest text-blue-300">
              Skills
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="rounded border border-slate-700/80 bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-blue-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Certifications in Sidebar */}
        {certifications.length > 0 && (
          <div className="space-y-2.5 break-inside-avoid print:break-inside-avoid" aria-label="Certifications">
            <h2 className="border-b border-slate-700 pb-1 text-xs font-bold uppercase tracking-widest text-blue-300">
              Certifications
            </h2>
            <div className="space-y-2 text-xs">
              {certifications.map((cert, idx) => (
                <div key={cert.id || idx} className="space-y-0.5">
                  <div className="font-semibold text-slate-100">{cert.name}</div>
                  {cert.issuer && <div className="text-[11px] text-slate-400">{cert.issuer}</div>}
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    {cert.issue_date && <span>{formatReadableDate(cert.issue_date)}</span>}
                    {cert.credential_url && (
                      <a
                        href={cert.credential_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-300 hover:underline"
                      >
                        Verify ↗
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Right Main Content (~65% width) */}
      <main className="w-full md:w-[65%] p-7 md:p-8 space-y-6 bg-white">
        {/* Name & Title Header */}
        <header className="border-b border-slate-100 pb-5 break-inside-avoid print:break-inside-avoid">
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight text-slate-950">
            {info.full_name || 'Candidate Name'}
          </h1>
          {info.professional_title && (
            <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-blue-600 md:text-base">
              {info.professional_title}
            </p>
          )}
        </header>

        {/* Professional Summary */}
        {cv.summary && (
          <section className="break-inside-avoid print:break-inside-avoid" aria-labelledby="modern-summary-heading">
            <h2
              id="modern-summary-heading"
              className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-2 flex items-center gap-2"
            >
              <span className="h-1 w-2.5 rounded-full bg-blue-500" />
              About Me
            </h2>
            <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
              {cv.summary}
            </p>
          </section>
        )}

        {/* Experience with modern timeline node styling */}
        {experiences.length > 0 && (
          <section className="space-y-4" aria-labelledby="modern-experience-heading">
            <h2
              id="modern-experience-heading"
              className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-3 flex items-center gap-2"
            >
              <span className="h-1 w-2.5 rounded-full bg-blue-500" />
              Work Experience
            </h2>
            <div className="relative border-l-2 border-slate-200 ml-2 space-y-5 pl-4">
              {experiences.map((exp, idx) => (
                <div key={exp.id || idx} className="relative break-inside-avoid print:break-inside-avoid">
                  {/* Timeline Dot */}
                  <span className="absolute -left-5.25 top-1 h-2.5 w-2.5 rounded-full bg-blue-500 ring-4 ring-white" />
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
                    <h3 className="min-w-0 flex-1 text-xs md:text-sm font-bold text-slate-900">
                      {exp.position}
                    </h3>
                    <span className="shrink-0 rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 print:bg-transparent sm:ml-4">
                      {formatDateRange(exp.start_date, exp.end_date, exp.is_current)}
                    </span>
                  </div>

                  <div className="text-xs font-medium text-slate-600 mt-0.5">
                    <span className="font-semibold text-slate-800">{exp.company}</span>
                    {exp.location && <span> • {exp.location}</span>}
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

        {/* Key Projects */}
        {projects.length > 0 && (
          <section className="space-y-3" aria-labelledby="modern-projects-heading">
            <h2
              id="modern-projects-heading"
              className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-3 flex items-center gap-2"
            >
              <span className="h-1 w-2.5 rounded-full bg-blue-500" />
              Featured Projects
            </h2>
            <div className="space-y-3">
              {projects.map((proj, idx) => (
                <div
                  key={proj.id || idx}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 break-inside-avoid print:break-inside-avoid print:border-none print:p-0"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                      <h3 className="min-w-0 text-xs md:text-sm font-bold text-slate-900">{proj.name}</h3>
                      {proj.project_url && (
                        <a
                          href={proj.project_url}
                          target="_blank"
                          rel="noreferrer"
                          className="break-all text-xs font-medium text-blue-600 hover:underline"
                        >
                          ↗ Link
                        </a>
                      )}
                    </div>
                    {(proj.start_date || proj.end_date) && (
                      <span className="shrink-0 text-xs text-slate-500 sm:ml-4">
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
      </main>
    </article>
  )
}
