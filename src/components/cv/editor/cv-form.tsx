'use client'

import React, { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm, useWatch } from 'react-hook-form'
import type { FieldErrors, Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cvSchema, type CVInput } from '@/lib/validations/cv'
import type { CVTemplate, CVWithRelations } from '@/types/cv'
import { createCV, updateCV, duplicateCV, deleteCV } from '@/lib/cv/actions'
import { PersonalInfoSection } from './personal-info-section'
import { SummarySection } from './summary-section'
import { SkillsSection } from './skills-section'
import { ExperienceSection } from './experience-section'
import { EducationSection } from './education-section'
import { ProjectsSection } from './projects-section'
import { CertificationsSection } from './certifications-section'
import { LivePreview } from '@/components/cv/live-preview'
import PDFDownloadButton from '@/components/cv/pdf-download-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  ArrowLeft,
  Save,
  Loader2,
  Copy,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Award,
  Layers,
  Eye,
  Edit3,
  Columns,
} from 'lucide-react'

interface CVFormProps {
  initialData?: CVWithRelations | null
}

const TEMPLATES: Array<{
  id: CVTemplate
  title: string
  description: string
  badge: string
}> = [
  {
    id: 'ats',
    title: 'ATS Clean',
    description: 'Clean, single-column, standard typography optimized for applicant tracking parsers.',
    badge: 'High Parsing Rate',
  },
  {
    id: 'professional',
    title: 'Professional',
    description: 'Balanced corporate layout with structured headers and clear section dividers.',
    badge: 'Popular',
  },
  {
    id: 'modern',
    title: 'Modern',
    description: 'Contemporary two-column design for portfolios, client-facing roles, and modern workplaces.',
    badge: 'Contemporary',
  },
]

type SectionId = 'basics' | 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications'

function firstInvalidSection(errors: FieldErrors<CVInput>): SectionId {
  if (errors.name || errors.template) return 'basics'
  if (errors.personal_info) return 'personal'
  if (errors.summary) return 'summary'
  if (errors.experiences) return 'experience'
  if (errors.educations) return 'education'
  if (errors.skills) return 'skills'
  if (errors.projects) return 'projects'
  if (errors.certifications) return 'certifications'
  return 'basics'
}

const SECTIONS: Array<{ id: SectionId; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'basics', label: 'CV Basics & Template', icon: Layers },
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'summary', label: 'Summary', icon: FileText },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'skills', label: 'Skills', icon: Wrench },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'certifications', label: 'Certifications', icon: Award },
]

export function CVForm({ initialData }: CVFormProps) {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<SectionId>('basics')
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit')
  const [desktopView, setDesktopView] = useState<'split' | 'edit' | 'preview'>('split')

  const isEditing = Boolean(initialData?.id)

  const defaultValues: CVInput = useMemo(
    () => ({
      name: initialData?.name || 'My Professional CV',
      template: (initialData?.template as CVTemplate) || 'professional',
      personal_info: {
        full_name: initialData?.personal_info?.full_name || '',
        professional_title: initialData?.personal_info?.professional_title || '',
        email: initialData?.personal_info?.email || '',
        phone: initialData?.personal_info?.phone || '',
        location: initialData?.personal_info?.location || '',
        linkedin: initialData?.personal_info?.linkedin || '',
        github: initialData?.personal_info?.github || '',
        portfolio: initialData?.personal_info?.portfolio || '',
        photo_url: initialData?.personal_info?.photo_url ?? null,
      },
      summary: initialData?.summary || '',
      skills: initialData?.skills || [],
      experiences: (initialData?.experiences || []).map((exp, idx) => ({
        company: exp.company,
        position: exp.position,
        location: exp.location || '',
        start_date: exp.start_date,
        end_date: exp.end_date || '',
        is_current: exp.is_current,
        description: exp.description || '',
        sort_order: exp.sort_order ?? idx,
      })),
      educations: (initialData?.educations || []).map((edu, idx) => ({
        institution: edu.institution,
        degree: edu.degree || '',
        field_of_study: edu.field_of_study || '',
        start_date: edu.start_date || '',
        end_date: edu.end_date || '',
        description: edu.description || '',
        sort_order: edu.sort_order ?? idx,
      })),
      projects: (initialData?.projects || []).map((proj, idx) => ({
        name: proj.name,
        description: proj.description || '',
        project_url: proj.project_url || '',
        start_date: proj.start_date || '',
        end_date: proj.end_date || '',
        sort_order: proj.sort_order ?? idx,
      })),
      certifications: (initialData?.certifications || []).map((cert, idx) => ({
        name: cert.name,
        issuer: cert.issuer || '',
        issue_date: cert.issue_date || '',
        credential_url: cert.credential_url || '',
        sort_order: cert.sort_order ?? idx,
      })),
    }),
    [initialData]
  )

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CVInput>({
    resolver: zodResolver(cvSchema) as Resolver<CVInput>,
    defaultValues,
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })

  // Supported useWatch to prevent React compiler memoization warnings
  const formValues = useWatch({ control, defaultValue: defaultValues })
  const selectedTemplate: CVTemplate = (formValues?.template || defaultValues.template) as CVTemplate
  const watchedName = formValues?.name || defaultValues.name || 'Untitled CV'

  // Construct real-time CVWithRelations for live preview & PDF export
  const previewCV: CVWithRelations = useMemo(() => {
    return {
      id: initialData?.id || 'preview-cv',
      user_id: initialData?.user_id || 'preview-user',
      name: watchedName,
      template: selectedTemplate,
      personal_info: {
        full_name: formValues?.personal_info?.full_name ?? '',
        professional_title: formValues?.personal_info?.professional_title ?? '',
        email: formValues?.personal_info?.email ?? '',
        phone: formValues?.personal_info?.phone ?? '',
        location: formValues?.personal_info?.location ?? '',
        linkedin: formValues?.personal_info?.linkedin ?? '',
        github: formValues?.personal_info?.github ?? '',
        portfolio: formValues?.personal_info?.portfolio ?? '',
        photo_url: formValues?.personal_info?.photo_url ?? null,
      },
      summary: formValues?.summary ?? null,
      skills: formValues?.skills ?? [],
      experiences: (formValues?.experiences ?? []).map((exp, idx) => ({
        id: initialData?.experiences?.[idx]?.id || `exp-${idx}`,
        cv_id: initialData?.id || 'preview-cv',
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
        id: initialData?.educations?.[idx]?.id || `edu-${idx}`,
        cv_id: initialData?.id || 'preview-cv',
        institution: edu?.institution || '',
        degree: edu?.degree || '',
        field_of_study: edu?.field_of_study || '',
        start_date: edu?.start_date || null,
        end_date: edu?.end_date || null,
        description: edu?.description || '',
        sort_order: idx,
      })),
      projects: (formValues?.projects ?? []).map((proj, idx) => ({
        id: initialData?.projects?.[idx]?.id || `proj-${idx}`,
        cv_id: initialData?.id || 'preview-cv',
        name: proj?.name || '',
        description: proj?.description || '',
        project_url: proj?.project_url || '',
        start_date: proj?.start_date || null,
        end_date: proj?.end_date || null,
        sort_order: idx,
      })),
      certifications: (formValues?.certifications ?? []).map((cert, idx) => ({
        id: initialData?.certifications?.[idx]?.id || `cert-${idx}`,
        cv_id: initialData?.id || 'preview-cv',
        name: cert?.name || '',
        issuer: cert?.issuer || '',
        issue_date: cert?.issue_date || null,
        credential_url: cert?.credential_url || '',
        sort_order: idx,
      })),
      created_at: initialData?.created_at || '2026-01-01T00:00:00.000Z',
      updated_at: initialData?.updated_at || '2026-01-01T00:00:00.000Z',
    }
  }, [formValues, initialData, selectedTemplate, watchedName])

  const handleTemplateChange = (newTemplate: CVTemplate) => {
    setValue('template', newTemplate, { shouldDirty: true, shouldValidate: true })
  }

  const onSubmit = async (data: CVInput) => {
    setServerError(null)
    setSuccessMessage(null)

    startTransition(async () => {
      try {
        if (isEditing && initialData?.id) {
          const res = await updateCV(initialData.id, data)
          if (!res.success) {
            setServerError(res.error || 'Failed to update CV.')
            return
          }
          setSuccessMessage('CV saved successfully!')
          router.refresh()
        } else {
          const res = await createCV(data)
          if (!res.success) {
            setServerError(res.error || 'Failed to create CV.')
            return
          }
          setSuccessMessage('CV created successfully!')
          router.push(`/dashboard/cv/${res.data.id}`)
        }
      } catch (err) {
        setServerError(err instanceof Error ? err.message : 'An unexpected error occurred.')
      }
    })
  }

  const onInvalid = (formErrors: FieldErrors<CVInput>) => {
    const section = firstInvalidSection(formErrors)
    setActiveSection(section)
    setMobileTab('edit')
    setServerError('Please fix the highlighted fields before saving or downloading your CV.')
    requestAnimationFrame(() => document.getElementById('cv-form-error-summary')?.focus())
  }

  const handleDuplicate = () => {
    if (!initialData?.id) return
    startTransition(async () => {
      const res = await duplicateCV(initialData.id)
      if (!res.success) {
        setServerError(res.error || 'Failed to duplicate CV.')
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
        setServerError(res.error || 'Failed to delete CV.')
        return
      }
      router.push('/dashboard/cv')
    })
  }

  const isBusy = isSubmitting || isPending
  const invalidSections = new Set<SectionId>()
  if (errors.name || errors.template) invalidSections.add('basics')
  if (errors.personal_info) invalidSections.add('personal')
  if (errors.summary) invalidSections.add('summary')
  if (errors.experiences) invalidSections.add('experience')
  if (errors.educations) invalidSections.add('education')
  if (errors.skills) invalidSections.add('skills')
  if (errors.projects) invalidSections.add('projects')
  if (errors.certifications) invalidSections.add('certifications')

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6" noValidate>
      {/* Top Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/cv"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Back to CV list"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
              {isEditing ? `Edit CV: ${watchedName || 'Untitled'}` : 'Create New CV'}
            </h1>
            <p className="text-xs text-slate-500 sm:text-sm">
              Fill in your details across each section. Live preview and PDF export update in real time.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Desktop View Switcher */}
          <div className="hidden items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 lg:inline-flex">
            <button
              type="button"
              onClick={() => setDesktopView('split')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                desktopView === 'split'
                  ? 'bg-white text-blue-600 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Side-by-side Editor & Preview"
            >
              <Columns className="h-3.5 w-3.5" />
              Split View
            </button>
            <button
              type="button"
              onClick={() => setDesktopView('edit')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                desktopView === 'edit'
                  ? 'bg-white text-blue-600 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Form Editor Only"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Editor
            </button>
            <button
              type="button"
              onClick={() => setDesktopView('preview')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                desktopView === 'preview'
                  ? 'bg-white text-blue-600 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Full Live Preview Only"
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </button>
          </div>

          {/* PDF Download Button */}
          <PDFDownloadButton
            cv={previewCV}
            template={selectedTemplate}
            variant="outline"
            size="sm"
          />

          {isEditing && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDuplicate}
                disabled={isBusy}
                className="gap-1.5"
              >
                <Copy className="h-4 w-4 text-slate-500" />
                Duplicate
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isBusy}
                className="gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </>
          )}

          <Button type="submit" disabled={isBusy} className="gap-2">
            {isBusy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {isEditing ? 'Save Changes' : 'Create CV'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {serverError && (
        <div
          id="cv-form-error-summary"
          role="alert"
          tabIndex={-1}
          className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <p>{serverError}</p>
        </div>
      )}

      {successMessage && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800"
        >
          <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-600" />
          <p>{successMessage}</p>
        </div>
      )}

      {/* Mobile View Mode Switcher */}
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-100 p-1 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileTab('edit')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-3 text-xs font-semibold transition-all ${
            mobileTab === 'edit'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          aria-label="Show Editor Form"
        >
          <Edit3 className="h-3.5 w-3.5" />
          Editor Form
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('preview')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-3 text-xs font-semibold transition-all ${
            mobileTab === 'preview'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          aria-label="Show Live Preview"
        >
          <Eye className="h-3.5 w-3.5" />
          Live Preview
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
        >
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Delete this CV?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete <strong>{watchedName}</strong>? This action will permanently remove all
              experiences, education, and projects linked to this CV.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isBusy}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="default"
                className="bg-red-600 hover:bg-red-700"
                onClick={handleDelete}
                disabled={isBusy}
              >
                {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Yes, Delete CV'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace: Form Editor & Live Preview */}
      <div className={`grid grid-cols-1 gap-8 ${desktopView === 'split' ? 'lg:grid-cols-12' : ''}`}>
        {/* Editor Form Column */}
        <div
          className={`space-y-6 ${
            mobileTab === 'preview' ? 'hidden lg:block' : 'block'
          } ${
            desktopView === 'split'
              ? 'lg:col-span-6'
              : desktopView === 'edit'
              ? 'lg:col-span-12'
              : 'lg:hidden'
          }`}
        >
          {/* Section Navigation Tabs */}
          <div className="overflow-x-auto pb-1">
            <nav
              aria-label="CV Editor Sections"
              className="flex min-w-max gap-2 border-b border-slate-200 pb-2"
            >
              {SECTIONS.map((sec) => {
                const Icon = sec.icon
                const isActive = activeSection === sec.id
                const hasError = invalidSections.has(sec.id)
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setActiveSection(sec.id)}
                    data-has-error={hasError || undefined}
                    className={`flex items-center gap-2 rounded-lg border px-3.5 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:py-2 ${
                      isActive
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : hasError
                          ? 'border-red-300 bg-red-50 text-red-800 hover:bg-red-100'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : hasError ? 'text-red-600' : 'text-slate-500'}`} />
                    {sec.label}
                    {hasError && !isActive ? <span className="h-1.5 w-1.5 rounded-full bg-red-600" aria-hidden="true" /> : null}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Active Section Panel */}
          <div className="space-y-6">
            {activeSection === 'basics' && (
              <Card className="border-stone-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                    <Layers className="h-5 w-5 text-blue-600" />
                    CV Basics & Template Selection
                  </CardTitle>
                  <CardDescription>
                    Choose an internal title to identify this CV and pick your target layout template.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* CV Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="cv_name" className="text-sm font-medium text-slate-700">
                      CV Name / Identifier <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="cv_name"
                      placeholder="e.g. Operations Coordinator CV (2026)"
                      {...register('name')}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-600" role="alert">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Template Picker */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700">Select Template Design</label>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {TEMPLATES.map((tmpl) => {
                        const isSelected = selectedTemplate === tmpl.id
                        return (
                          <div
                            key={tmpl.id}
                            onClick={() => handleTemplateChange(tmpl.id)}
                            className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                                {tmpl.badge}
                              </span>
                              {isSelected && <CheckCircle2 className="h-5 w-5 text-blue-600" />}
                            </div>
                            <h4 className="font-semibold text-slate-900">{tmpl.title}</h4>
                            <p className="mt-1 text-xs text-slate-500">{tmpl.description}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'personal' && (
              <PersonalInfoSection
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
              />
            )}

            {activeSection === 'summary' && <SummarySection register={register} errors={errors} />}

            {activeSection === 'experience' && (
              <ExperienceSection
                control={control}
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
              />
            )}

            {activeSection === 'education' && (
              <EducationSection
                control={control}
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
              />
            )}

            {activeSection === 'skills' && <SkillsSection watch={watch} setValue={setValue} errors={errors} />}

            {activeSection === 'projects' && (
              <ProjectsSection
                control={control}
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
              />
            )}

            {activeSection === 'certifications' && (
              <CertificationsSection
                control={control}
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
              />
            )}
          </div>

          {/* Bottom Action Section Controls */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-4">
            <div className="flex gap-2">
              {SECTIONS.findIndex((s) => s.id === activeSection) > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const curIdx = SECTIONS.findIndex((s) => s.id === activeSection)
                    if (curIdx > 0) setActiveSection(SECTIONS[curIdx - 1].id)
                  }}
                >
                  Previous Section
                </Button>
              )}
              {SECTIONS.findIndex((s) => s.id === activeSection) < SECTIONS.length - 1 && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const curIdx = SECTIONS.findIndex((s) => s.id === activeSection)
                    if (curIdx < SECTIONS.length - 1) setActiveSection(SECTIONS[curIdx + 1].id)
                  }}
                >
                  Next: {SECTIONS[SECTIONS.findIndex((s) => s.id === activeSection) + 1].label}
                </Button>
              )}
            </div>

            <Button type="submit" disabled={isBusy} className="gap-2">
              {isBusy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEditing ? 'Save Changes' : 'Create CV'}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Live Preview Column */}
        <div
          className={`space-y-4 ${
            mobileTab === 'edit' ? 'hidden lg:block' : 'block'
          } ${
            desktopView === 'split'
              ? 'lg:col-span-6 lg:sticky lg:top-4 lg:self-start'
              : desktopView === 'preview'
              ? 'lg:col-span-12'
              : 'lg:hidden'
          }`}
        >
          <div className="overflow-hidden rounded-lg border border-stone-300 bg-stone-100">
            <LivePreview
              cv={previewCV}
              template={selectedTemplate}
              onTemplateChange={handleTemplateChange}
              showControls={true}
              showSampleToggle={true}
              initialScale={desktopView === 'split' ? 0.75 : 1}
            />
          </div>
        </div>
      </div>
    </form>
  )
}
