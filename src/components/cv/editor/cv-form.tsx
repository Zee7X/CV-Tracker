'use client'

import React, { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm, useWatch } from 'react-hook-form'
import type { FieldErrors, Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cvSchema, type CVInput } from '@/lib/validations/cv'
import type { CVTemplate, CVWithRelations, DocumentLanguage } from '@/types/cv'
import { createCV, updateCV, duplicateCV, deleteCV } from '@/lib/cv/actions'
import { DOCUMENT_LANGUAGES, resolveDocumentLanguage, toMonthValue } from '@/lib/cv/document'
import { PersonalInfoSection } from './personal-info-section'
import { SummarySection } from './summary-section'
import { SkillsSection } from './skills-section'
import { ExperienceSection } from './experience-section'
import { EducationSection } from './education-section'
import { ProjectsSection } from './projects-section'
import { CertificationsSection } from './certifications-section'
import { EditorSection, Field } from './fields'
import { LivePreview } from '@/components/cv/live-preview'
import { TEMPLATES_METADATA } from '@/components/cv/templates'
import PDFDownloadButton from '@/components/cv/pdf-download-button'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Input } from '@/components/ui/input'
import { AlertCircle, ArrowLeft, Check, Loader2, MoreHorizontal, PanelRightClose, PanelRightOpen } from 'lucide-react'

interface CVFormProps {
  initialData?: CVWithRelations | null
}

// Same order as the sections appear on the finished CV, so filling the form
// top to bottom matches reading the document top to bottom.
const SECTIONS = [
  { id: 'settings', label: 'Settings' },
  { id: 'personal', label: 'Personal' },
  { id: 'summary', label: 'Summary' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'education', label: 'Education' },
  { id: 'certifications', label: 'Certifications' },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

function sectionsWithErrors(errors: FieldErrors<CVInput>): Set<SectionId> {
  const invalid = new Set<SectionId>()
  if (errors.name || errors.template || errors.personal_info?.document_language) invalid.add('settings')
  if (errors.personal_info && Object.keys(errors.personal_info).some((key) => key !== 'document_language')) invalid.add('personal')
  if (errors.summary) invalid.add('summary')
  if (errors.skills) invalid.add('skills')
  if (errors.experiences) invalid.add('experience')
  if (errors.projects) invalid.add('projects')
  if (errors.educations) invalid.add('education')
  if (errors.certifications) invalid.add('certifications')
  return invalid
}

function toFormValues(cv?: CVWithRelations | null): CVInput {
  const info = cv?.personal_info
  return {
    name: cv?.name || 'My CV',
    template: (cv?.template as CVTemplate) || 'ats',
    personal_info: {
      document_language: resolveDocumentLanguage(info?.document_language),
      full_name: info?.full_name || '',
      professional_title: info?.professional_title || '',
      email: info?.email || '',
      phone: info?.phone || '',
      location: info?.location || '',
      linkedin: info?.linkedin || '',
      github: info?.github || '',
      portfolio: info?.portfolio || '',
      photo_url: info?.photo_url ?? null,
    },
    summary: cv?.summary || '',
    skills: cv?.skills || [],
    experiences: (cv?.experiences || []).map((exp, idx) => ({
      company: exp.company,
      position: exp.position,
      location: exp.location || '',
      start_date: toMonthValue(exp.start_date),
      end_date: toMonthValue(exp.end_date),
      is_current: exp.is_current,
      description: exp.description || '',
      sort_order: exp.sort_order ?? idx,
    })),
    educations: (cv?.educations || []).map((edu, idx) => ({
      institution: edu.institution,
      degree: edu.degree || '',
      field_of_study: edu.field_of_study || '',
      start_date: toMonthValue(edu.start_date),
      end_date: toMonthValue(edu.end_date),
      description: edu.description || '',
      sort_order: edu.sort_order ?? idx,
    })),
    projects: (cv?.projects || []).map((proj, idx) => ({
      name: proj.name,
      description: proj.description || '',
      project_url: proj.project_url || '',
      start_date: toMonthValue(proj.start_date),
      end_date: toMonthValue(proj.end_date),
      sort_order: proj.sort_order ?? idx,
    })),
    certifications: (cv?.certifications || []).map((cert, idx) => ({
      name: cert.name,
      issuer: cert.issuer || '',
      issue_date: toMonthValue(cert.issue_date),
      credential_url: cert.credential_url || '',
      sort_order: cert.sort_order ?? idx,
    })),
  }
}

export function CVForm({ initialData }: CVFormProps) {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<SectionId>('personal')
  const [serverError, setServerError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [isPending, startTransition] = useTransition()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit')
  const [showPreview, setShowPreview] = useState(true)
  const menuRef = useRef<HTMLDivElement>(null)
  const sectionNavRef = useRef<HTMLElement>(null)

  // From the Back/Next buttons at the bottom of a long section, bring the tabs
  // back into view so the new section starts at its top.
  const goToSection = (id: SectionId) => {
    setActiveSection(id)
    const nav = sectionNavRef.current
    if (nav && nav.getBoundingClientRect().top < 64) {
      requestAnimationFrame(() => nav.scrollIntoView({ block: 'start' }))
    }
  }

  const isEditing = Boolean(initialData?.id)
  const defaultValues = useMemo(() => toFormValues(initialData), [initialData])

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CVInput>({
    resolver: zodResolver(cvSchema) as Resolver<CVInput>,
    defaultValues,
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })

  const formValues = useWatch({ control, defaultValue: defaultValues })
  const selectedTemplate = (formValues?.template || defaultValues.template) as CVTemplate
  const documentLanguage = resolveDocumentLanguage(formValues?.personal_info?.document_language)
  const cvName = formValues?.name?.trim() || 'Untitled CV'

  // Overflow menu: focus the first item on open, arrow keys move between items,
  // Escape closes and returns focus to the trigger, an outside click closes.
  useEffect(() => {
    if (!menuOpen) return
    const items = () => [...(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') ?? [])]
    items()[0]?.focus()
    const onPointer = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        menuRef.current?.querySelector<HTMLButtonElement>('[aria-haspopup="menu"]')?.focus()
        return
      }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        const list = items()
        if (!list.length) return
        event.preventDefault()
        const current = list.indexOf(document.activeElement as HTMLButtonElement)
        const step = event.key === 'ArrowDown' ? 1 : -1
        list[(current + step + list.length) % list.length].focus()
      }
    }
    const onFocusOut = (event: FocusEvent) => {
      // Tabbing out of the menu closes it.
      if (event.relatedTarget && !menuRef.current?.contains(event.relatedTarget as Node)) setMenuOpen(false)
    }
    const container = menuRef.current
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    container?.addEventListener('focusout', onFocusOut)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
      container?.removeEventListener('focusout', onFocusOut)
    }
  }, [menuOpen])

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    if (!isDirty) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isDirty])

  const previewCV: CVWithRelations = useMemo(() => {
    const cvId = initialData?.id || 'preview-cv'
    const info = formValues?.personal_info
    return {
      id: cvId,
      user_id: initialData?.user_id || 'preview-user',
      name: cvName,
      template: selectedTemplate,
      personal_info: {
        document_language: documentLanguage,
        full_name: info?.full_name ?? '',
        professional_title: info?.professional_title ?? '',
        email: info?.email ?? '',
        phone: info?.phone ?? '',
        location: info?.location ?? '',
        linkedin: info?.linkedin ?? '',
        github: info?.github ?? '',
        portfolio: info?.portfolio ?? '',
        photo_url: info?.photo_url ?? null,
      },
      summary: formValues?.summary ?? null,
      skills: (formValues?.skills ?? []).filter((skill): skill is string => Boolean(skill)),
      experiences: (formValues?.experiences ?? []).map((exp, idx) => ({
        id: `exp-${idx}`,
        cv_id: cvId,
        company: exp?.company || '',
        position: exp?.position || '',
        location: exp?.location || '',
        start_date: exp?.start_date || '',
        end_date: exp?.end_date || null,
        is_current: Boolean(exp?.is_current),
        description: exp?.description || '',
        sort_order: idx,
      })),
      educations: (formValues?.educations ?? []).map((edu, idx) => ({
        id: `edu-${idx}`,
        cv_id: cvId,
        institution: edu?.institution || '',
        degree: edu?.degree || '',
        field_of_study: edu?.field_of_study || '',
        start_date: edu?.start_date || null,
        end_date: edu?.end_date || null,
        description: edu?.description || '',
        sort_order: idx,
      })),
      projects: (formValues?.projects ?? []).map((proj, idx) => ({
        id: `proj-${idx}`,
        cv_id: cvId,
        name: proj?.name || '',
        description: proj?.description || '',
        project_url: proj?.project_url || '',
        start_date: proj?.start_date || null,
        end_date: proj?.end_date || null,
        sort_order: idx,
      })),
      certifications: (formValues?.certifications ?? []).map((cert, idx) => ({
        id: `cert-${idx}`,
        cv_id: cvId,
        name: cert?.name || '',
        issuer: cert?.issuer || '',
        issue_date: cert?.issue_date || null,
        credential_url: cert?.credential_url || '',
        sort_order: idx,
      })),
      created_at: initialData?.created_at || '2026-01-01T00:00:00.000Z',
      updated_at: initialData?.updated_at || '2026-01-01T00:00:00.000Z',
    }
  }, [formValues, initialData, selectedTemplate, documentLanguage, cvName])

  const setTemplate = (template: CVTemplate) => setValue('template', template, { shouldDirty: true, shouldValidate: true })
  const setLanguage = (language: DocumentLanguage) =>
    setValue('personal_info.document_language', language, { shouldDirty: true, shouldValidate: true })

  const onSubmit = (data: CVInput) => {
    setServerError(null)
    startTransition(async () => {
      try {
        if (isEditing && initialData?.id) {
          const res = await updateCV(initialData.id, data)
          if (!res.success) {
            setServerError(res.error || 'Could not save the CV.')
            return
          }
          reset(data)
          setSavedAt(new Date())
          router.refresh()
        } else {
          const res = await createCV(data)
          if (!res.success) {
            setServerError(res.error || 'Could not create the CV.')
            return
          }
          reset(data)
          router.push(`/dashboard/cv/${res.data.id}`)
        }
      } catch (err) {
        setServerError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
      }
    })
  }

  const onInvalid = (formErrors: FieldErrors<CVInput>) => {
    const first = SECTIONS.find((section) => sectionsWithErrors(formErrors).has(section.id))
    if (first) setActiveSection(first.id)
    setMobileTab('edit')
    setServerError('Some fields need attention. Sections with problems are marked in red.')
    requestAnimationFrame(() => document.getElementById('cv-form-error-summary')?.focus())
  }

  const handleDuplicate = () => {
    if (!initialData?.id) return
    setMenuOpen(false)
    startTransition(async () => {
      const res = await duplicateCV(initialData.id)
      if (!res.success) {
        setServerError(res.error || 'Could not duplicate the CV.')
        return
      }
      router.push(`/dashboard/cv/${res.data.id}`)
    })
  }

  const handleDelete = () => {
    if (!initialData?.id) return
    startTransition(async () => {
      const res = await deleteCV(initialData.id)
      if (!res.success) {
        setShowDeleteConfirm(false)
        setServerError(res.error || 'Could not delete the CV.')
        return
      }
      router.push('/dashboard/cv')
    })
  }

  const isBusy = isSubmitting || isPending
  const invalidSections = sectionsWithErrors(errors)
  const sectionIndex = SECTIONS.findIndex((section) => section.id === activeSection)
  const nextSection = SECTIONS[sectionIndex + 1]

  const saveStatus = isBusy
    ? 'Saving'
    : isDirty
      ? 'Unsaved changes'
      : savedAt
        ? (
            <>
              <span>Saved at</span> {savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </>
          )
        : isEditing
          ? 'All changes saved'
          : 'Not saved yet'

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/dashboard/cv"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800"
            aria-label="Back to all CVs"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold text-stone-950">{isEditing ? cvName : 'New CV'}</h1>
            <p className="text-sm text-stone-600" aria-live="polite">
              {saveStatus}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview((value) => !value)}
            className="hidden h-9 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-200/70 hover:text-stone-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800 lg:inline-flex"
            aria-pressed={showPreview}
          >
            {showPreview ? (
              <PanelRightClose className="h-4 w-4" aria-hidden="true" />
            ) : (
              <PanelRightOpen className="h-4 w-4" aria-hidden="true" />
            )}
            {showPreview ? 'Hide preview' : 'Show preview'}
          </button>

          <PDFDownloadButton
            cv={previewCV}
            template={selectedTemplate}
            variant="outline"
            size="sm"
            onInvalid={() => {
              void trigger().then(() => handleSubmit(() => undefined, onInvalid)())
            }}
          />

          <Button type="submit" size="sm" disabled={isBusy || (isEditing && !isDirty)}>
            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {isEditing ? 'Save changes' : 'Create CV'}
          </Button>

          {isEditing ? (
            <div ref={menuRef} className="relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="More actions"
              >
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </Button>
              {menuOpen ? (
                <div
                  role="menu"
                  className="menu-enter absolute right-0 top-full z-30 mt-1 w-48 rounded-md border border-stone-300 bg-white py-1 shadow-lg"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleDuplicate}
                    disabled={isBusy}
                    className="block w-full px-3 py-2 text-left text-sm text-stone-800 outline-none hover:bg-stone-100 focus-visible:bg-stone-100 disabled:opacity-50"
                  >
                    Duplicate CV
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false)
                      setShowDeleteConfirm(true)
                    }}
                    disabled={isBusy}
                    className="block w-full px-3 py-2 text-left text-sm text-red-700 outline-none hover:bg-red-50 focus-visible:bg-red-50 disabled:opacity-50"
                  >
                    Delete CV
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {serverError ? (
        <div
          id="cv-form-error-summary"
          role="alert"
          tabIndex={-1}
          className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 focus:outline-none"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p className="flex-1">{serverError}</p>
          <button type="button" onClick={() => setServerError(null)} className="text-xs font-semibold underline-offset-4 hover:underline">
            Dismiss
          </button>
        </div>
      ) : null}

      {/* Mobile: switch between form and preview */}
      <div role="tablist" aria-label="Editor view" className="grid grid-cols-2 rounded-md border border-stone-300 bg-stone-100 p-1 lg:hidden">
        {(['edit', 'preview'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={mobileTab === tab}
            onClick={() => setMobileTab(tab)}
            className={`rounded py-2 text-sm font-semibold ${
              mobileTab === tab ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-600'
            }`}
          >
            {tab === 'edit' ? 'Edit' : 'Preview'}
          </button>
        ))}
      </div>

      <div className={`grid grid-cols-1 gap-6 ${showPreview ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]' : ''}`}>
        {/* Editor */}
        <div className={`min-w-0 space-y-5 ${mobileTab === 'preview' ? 'hidden lg:block' : ''} ${showPreview ? '' : 'lg:mx-auto lg:w-full lg:max-w-3xl'}`}>
          <nav ref={sectionNavRef} aria-label="CV sections" className="scrollbar-none -mx-1 scroll-mt-20 overflow-x-auto px-1">
            <ul className="flex min-w-max gap-1 border-b border-stone-300">
              {SECTIONS.map((section) => {
                const isActive = activeSection === section.id
                const hasError = invalidSections.has(section.id)
                return (
                  <li key={section.id}>
                    <button
                      type="button"
                      onClick={() => setActiveSection(section.id)}
                      aria-current={isActive ? 'step' : undefined}
                      data-has-error={hasError || undefined}
                      className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-800 ${
                        isActive
                          ? 'border-blue-800 text-stone-950'
                          : hasError
                            ? 'border-transparent text-red-700 hover:border-red-300'
                            : 'border-transparent text-stone-600 hover:border-stone-400 hover:text-stone-950'
                      }`}
                    >
                      {section.label}
                      {hasError ? <span className="sr-only">(has errors)</span> : null}
                      {hasError ? <AlertCircle className="h-3.5 w-3.5 text-red-700" aria-hidden="true" /> : null}
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Keyed so switching sections fades the new one in instead of swapping abruptly. */}
          <div key={activeSection} className="section-enter space-y-5">
            {activeSection === 'settings' ? (
              <EditorSection title="CV settings" description="These control how the document looks. They are not printed on the CV.">
                <Field id="cv_name" label="CV name" required hint="Only you see this, e.g. the role or company it is for." error={errors.name?.message}>
                  <Input id="cv_name" placeholder="Technical Support, Influx" {...register('name')} />
                </Field>

                <fieldset className="space-y-2">
                  <legend className="text-sm font-medium text-stone-800">CV language</legend>
                  <p className="text-xs text-stone-500">
                    Sets section headings and dates (for example &quot;Jun 2024 – Present&quot;). Write your own text in the same language.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {DOCUMENT_LANGUAGES.map((language) => (
                      <label
                        key={language.id}
                        className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                          documentLanguage === language.id
                            ? 'border-blue-800 bg-blue-50 text-stone-950'
                            : 'border-stone-300 bg-white text-stone-700 hover:border-stone-500'
                        }`}
                      >
                        <input
                          type="radio"
                          name="document_language"
                          value={language.id}
                          checked={documentLanguage === language.id}
                          onChange={() => setLanguage(language.id)}
                          className="accent-blue-800"
                        />
                        {language.label}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="space-y-2">
                  <legend className="text-sm font-medium text-stone-800">Template</legend>
                  <div className="grid grid-cols-1 gap-2">
                    {TEMPLATES_METADATA.map((template) => {
                      const selected = selectedTemplate === template.id
                      return (
                        <label
                          key={template.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-md border px-3 py-3 ${
                            selected ? 'border-blue-800 bg-blue-50' : 'border-stone-300 bg-white hover:border-stone-500'
                          }`}
                        >
                          <input
                            type="radio"
                            name="template"
                            value={template.id}
                            checked={selected}
                            onChange={() => setTemplate(template.id)}
                            className="mt-0.5 accent-blue-800"
                          />
                          <span>
                            <span className="block text-sm font-semibold text-stone-950" data-no-translate>
                              {template.name}
                            </span>
                            <span className="block text-sm text-stone-600">{template.description}</span>
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </fieldset>
              </EditorSection>
            ) : null}

            {activeSection === 'personal' ? (
              <PersonalInfoSection register={register} errors={errors} watch={watch} setValue={setValue} template={selectedTemplate} />
            ) : null}
            {activeSection === 'summary' ? <SummarySection register={register} errors={errors} /> : null}
            {activeSection === 'skills' ? <SkillsSection watch={watch} setValue={setValue} errors={errors} /> : null}
            {activeSection === 'experience' ? (
              <ExperienceSection control={control} register={register} errors={errors} watch={watch} setValue={setValue} />
            ) : null}
            {activeSection === 'projects' ? (
              <ProjectsSection control={control} register={register} errors={errors} watch={watch} />
            ) : null}
            {activeSection === 'education' ? (
              <EducationSection control={control} register={register} errors={errors} watch={watch} />
            ) : null}
            {activeSection === 'certifications' ? (
              <CertificationsSection control={control} register={register} errors={errors} watch={watch} />
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-2">
            {sectionIndex > 0 ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => goToSection(SECTIONS[sectionIndex - 1].id)}>
                Back
              </Button>
            ) : (
              <span />
            )}
            {nextSection ? (
              <Button type="button" variant="outline" size="sm" onClick={() => goToSection(nextSection.id)}>
                {`Next: ${nextSection.label}`}
              </Button>
            ) : (
              <Button type="submit" size="sm" disabled={isBusy || (isEditing && !isDirty)}>
                {isBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
                {isEditing ? 'Save changes' : 'Create CV'}
              </Button>
            )}
          </div>
        </div>

        {/* Preview */}
        {showPreview || mobileTab === 'preview' ? (
          <div
            className={`min-w-0 ${mobileTab === 'edit' ? 'hidden lg:block' : ''} ${showPreview ? '' : 'lg:hidden'} lg:sticky lg:top-20 lg:self-start`}
          >
            <LivePreview
              cv={previewCV}
              template={selectedTemplate}
              onTemplateChange={setTemplate}
              containerClassName="lg:h-[calc(100vh-7rem)]"
            />
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete this CV?"
        subject={cvName}
        confirmLabel="Delete CV"
        pending={isBusy}
      >
        This removes the CV with all its experience, education, projects and certifications. Applications and cover
        letters that used it are kept, but no longer point to a CV. This cannot be undone.
      </ConfirmDialog>
    </form>
  )
}
