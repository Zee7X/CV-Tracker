'use client'

import React, { useState, useTransition, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft,
  Save,
  Download,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  FileText,
  Building2,
  Briefcase,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  Edit3,
} from 'lucide-react'
import { pdf } from '@react-pdf/renderer'
import type { CoverLetter, CoverLetterTemplate } from '@/types/cover-letter'
import type { CV } from '@/types/cv'
import {
  coverLetterSchema,
  type CoverLetterFormValues,
} from '@/lib/validations/cover-letter'
import {
  COVER_LETTER_TEMPLATES,
  generateTemplateContent,
  formatCoverLetterPlaintext,
  formatCoverLetterDate,
  substituteCoverLetterTokens,
} from '@/lib/cover-letter/templates'
import { useLanguage } from '@/components/i18n/language-provider'
import { CoverLetterPDFDocument } from '@/lib/cover-letter/pdf'
import { triggerDownload } from '@/lib/pdf/generator'
import { createCoverLetter, updateCoverLetter } from '@/lib/cover-letter/actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const COVER_LETTERS_MIGRATION_SQL = `-- Migration: Create cover_letters table and RLS policies
create table if not exists public.cover_letters (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  template text not null default 'formal_id' check (template in ('formal_id', 'professional_en', 'email_short', 'creative')),
  job_title text not null,
  company_name text not null,
  company_address text,
  recipient_name text,
  source text,
  letter_date text not null,
  sender_name text not null,
  sender_email text not null,
  sender_phone text,
  sender_location text,
  opening text not null default '',
  body text not null default '',
  closing text not null default '',
  cv_id uuid references public.cvs(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists cover_letters_user_id_idx on public.cover_letters(user_id);
create index if not exists cover_letters_cv_id_idx on public.cover_letters(cv_id);

-- Enable RLS
alter table public.cover_letters enable row level security;

-- Policies
create policy "Users can view own cover letters"
  on public.cover_letters for select
  using (auth.uid() = user_id);

create policy "Users can insert own cover letters"
  on public.cover_letters for insert
  with check (auth.uid() = user_id);

create policy "Users can update own cover letters"
  on public.cover_letters for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own cover letters"
  on public.cover_letters for delete
  using (auth.uid() = user_id);`

interface CoverLetterFormProps {
  initialData?: CoverLetter | null
  availableCVs?: CV[]
  userProfile?: {
    full_name?: string | null
    email?: string
  }
}

export function CoverLetterForm({
  initialData,
  availableCVs = [],
  userProfile,
}: CoverLetterFormProps) {
  const router = useRouter()
  const { language } = useLanguage()
  const [isPending, startTransition] = useTransition()
  const [isExporting, setIsExporting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedSQL, setCopiedSQL] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form')
  const [selectedCvId, setSelectedCvId] = useState<string>(initialData?.cv_id || '')
  const [skillsSummary, setSkillsSummary] = useState('')

  const isEditing = Boolean(initialData?.id)
  const isUserEditedRef = React.useRef(Boolean(isEditing || initialData?.opening))
  const isTitleEditedRef = React.useRef(Boolean(isEditing || initialData?.title))

  const defaultValues: CoverLetterFormValues = {
    title: initialData?.title || (language === 'en' ? 'Job Application Letter' : 'Surat Lamaran Pekerjaan'),
    template: initialData?.template || (language === 'en' ? 'professional_en' : 'formal_id'),
    job_title: initialData?.job_title || '',
    company_name: initialData?.company_name || '',
    company_address: initialData?.company_address || '',
    recipient_name: initialData?.recipient_name || '',
    source: initialData?.source || '',
    letter_date: initialData?.letter_date || new Date().toISOString().split('T')[0],
    sender_name: initialData?.sender_name || userProfile?.full_name || '',
    sender_email: initialData?.sender_email || userProfile?.email || '',
    sender_phone: initialData?.sender_phone || '',
    sender_location: initialData?.sender_location || '',
    opening: initialData?.opening || '',
    body: initialData?.body || '',
    closing: initialData?.closing || '',
    cv_id: initialData?.cv_id || undefined,
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CoverLetterFormValues>({
    resolver: zodResolver(coverLetterSchema),
    defaultValues,
  })

  const watchedValues = watch()
  const currentTemplate = watch('template')
  const watchedJobTitle = watch('job_title')
  const watchedCompanyName = watch('company_name')
  const watchedRecipientName = watch('recipient_name')
  const watchedSource = watch('source')
  const watchedSenderName = watch('sender_name')
  const isEn = currentTemplate === 'professional_en' || language === 'en'

  // Auto-sync letter content with Job Details & Company info
  useEffect(() => {
    if (!isUserEditedRef.current) {
      const generated = generateTemplateContent({
        template: currentTemplate,
        jobTitle: watchedJobTitle || undefined,
        companyName: watchedCompanyName || undefined,
        recipientName: watchedRecipientName || undefined,
        source: watchedSource || undefined,
        senderName: watchedSenderName || undefined,
        skillsSummary: skillsSummary || undefined,
        language,
      })
      setValue('opening', generated.opening)
      setValue('body', generated.body)
      setValue('closing', generated.closing)
    } else {
      // If user has customized paragraphs, substitute any placeholders that still exist
      const curOpening = watchedValues.opening || ''
      const curBody = watchedValues.body || ''
      const curClosing = watchedValues.closing || ''

      const subParams = {
        jobTitle: watchedJobTitle,
        companyName: watchedCompanyName,
        recipientName: watchedRecipientName,
        senderName: watchedSenderName,
        source: watchedSource,
      }

      const nextOpening = substituteCoverLetterTokens(curOpening, subParams)
      const nextBody = substituteCoverLetterTokens(curBody, subParams)
      const nextClosing = substituteCoverLetterTokens(curClosing, subParams)

      if (nextOpening !== curOpening) setValue('opening', nextOpening)
      if (nextBody !== curBody) setValue('body', nextBody)
      if (nextClosing !== curClosing) setValue('closing', nextClosing)
    }
  }, [
    watchedJobTitle,
    watchedCompanyName,
    watchedRecipientName,
    watchedSource,
    watchedSenderName,
    currentTemplate,
    skillsSummary,
    language,
    setValue,
  ]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-update document title if user hasn't typed a custom title
  useEffect(() => {
    if (!isTitleEditedRef.current && !isEditing) {
      if (watchedJobTitle?.trim() || watchedCompanyName?.trim()) {
        const role = watchedJobTitle?.trim() || (isEn ? 'Position' : 'Posisi')
        const company = watchedCompanyName?.trim() ? ` - ${watchedCompanyName.trim()}` : ''
        const newTitle = isEn ? `Application for ${role}${company}` : `Lamaran ${role}${company}`
        setValue('title', newTitle)
      } else {
        setValue('title', isEn ? 'Job Application Letter' : 'Surat Lamaran Pekerjaan')
      }
    }
  }, [watchedJobTitle, watchedCompanyName, isEn, isEditing, setValue])

  // Handle template change
  const handleSelectTemplate = (tmpl: CoverLetterTemplate) => {
    setValue('template', tmpl)
    isUserEditedRef.current = false
    const generated = generateTemplateContent({
      template: tmpl,
      jobTitle: watchedJobTitle || undefined,
      companyName: watchedCompanyName || undefined,
      recipientName: watchedRecipientName || undefined,
      source: watchedSource || undefined,
      senderName: watchedSenderName || undefined,
      skillsSummary: skillsSummary || undefined,
      language,
    })
    setValue('opening', generated.opening)
    setValue('body', generated.body)
    setValue('closing', generated.closing)
  }

  // Handle re-generate button
  const handleRegenerate = () => {
    isUserEditedRef.current = false
    const generated = generateTemplateContent({
      template: currentTemplate,
      jobTitle: watchedJobTitle || undefined,
      companyName: watchedCompanyName || undefined,
      recipientName: watchedRecipientName || undefined,
      source: watchedSource || undefined,
      senderName: watchedSenderName || undefined,
      skillsSummary: skillsSummary || undefined,
      language,
    })
    setValue('opening', generated.opening)
    setValue('body', generated.body)
    setValue('closing', generated.closing)
  }

  // Handle import from existing CV
  const handleImportFromCV = () => {
    if (!selectedCvId) return
    const sourceCV = availableCVs.find((c) => c.id === selectedCvId)
    if (!sourceCV) return

    setValue('cv_id', sourceCV.id)
    if (sourceCV.personal_info?.full_name) setValue('sender_name', sourceCV.personal_info.full_name)
    if (sourceCV.personal_info?.email) setValue('sender_email', sourceCV.personal_info.email)
    if (sourceCV.personal_info?.phone) setValue('sender_phone', sourceCV.personal_info.phone)
    if (sourceCV.personal_info?.location) setValue('sender_location', sourceCV.personal_info.location)

    // Build skills summary from top 4 skills
    const topSkills = (sourceCV.skills || []).slice(0, 4).join(', ')
    setSkillsSummary(topSkills)

    isUserEditedRef.current = false
    const generated = generateTemplateContent({
      template: currentTemplate,
      jobTitle: watchedJobTitle || undefined,
      companyName: watchedCompanyName || undefined,
      recipientName: watchedRecipientName || undefined,
      source: watchedSource || undefined,
      senderName: sourceCV.personal_info?.full_name || watchedSenderName || undefined,
      skillsSummary: topSkills || undefined,
      language,
    })
    setValue('opening', generated.opening)
    setValue('body', generated.body)
    setValue('closing', generated.closing)
  }

  const getSanitizedLetter = (): CoverLetterFormValues => {
    const vals = watch()
    const subParams = {
      jobTitle: vals.job_title,
      companyName: vals.company_name,
      senderName: vals.sender_name,
      recipientName: vals.recipient_name,
      source: vals.source,
    }
    return {
      ...vals,
      opening: substituteCoverLetterTokens(vals.opening || '', subParams),
      body: substituteCoverLetterTokens(vals.body || '', subParams),
      closing: substituteCoverLetterTokens(vals.closing || '', subParams),
    }
  }

  // Copy plaintext to clipboard
  const handleCopy = async () => {
    const cleanLetter = getSanitizedLetter()
    const text = formatCoverLetterPlaintext(cleanLetter, isEn ? 'en' : 'id')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  // Download PDF
  const handleDownloadPDF = async () => {
    setIsExporting(true)
    try {
      const cleanLetter = getSanitizedLetter()
      const doc = <CoverLetterPDFDocument letter={cleanLetter} language={isEn ? 'en' : 'id'} />
      const blob = await pdf(doc).toBlob()
      const url = URL.createObjectURL(blob)
      const filename = isEn
        ? `${cleanLetter.sender_name || 'Cover'}-Letter-${cleanLetter.company_name || 'Application'}.pdf`
        : `${cleanLetter.sender_name || 'Surat'}-Lamaran-${cleanLetter.company_name || 'Kerja'}.pdf`
      triggerDownload(url, filename)
    } catch (err) {
      console.error('PDF export failed:', err)
    } finally {
      setIsExporting(false)
    }
  }

  const handleCopySQLMigration = async () => {
    try {
      await navigator.clipboard.writeText(COVER_LETTERS_MIGRATION_SQL)
      setCopiedSQL(true)
      setTimeout(() => setCopiedSQL(false), 2500)
    } catch {
      // ignore
    }
  }

  const onSubmit = async (values: CoverLetterFormValues) => {
    setServerError(null)
    setSuccessMessage(null)

    const subParams = {
      jobTitle: values.job_title,
      companyName: values.company_name,
      senderName: values.sender_name,
      recipientName: values.recipient_name,
      source: values.source,
    }
    const cleanValues: CoverLetterFormValues = {
      ...values,
      opening: substituteCoverLetterTokens(values.opening || '', subParams),
      body: substituteCoverLetterTokens(values.body || '', subParams),
      closing: substituteCoverLetterTokens(values.closing || '', subParams),
    }

    startTransition(async () => {
      if (isEditing && initialData?.id) {
        const res = await updateCoverLetter(initialData.id, cleanValues)
        if (!res.success) {
          setServerError(res.error || 'Failed to update cover letter.')
          return
        }
        setSuccessMessage('Cover letter saved successfully!')
      } else {
        const res = await createCoverLetter(cleanValues)
        if (!res.success || !res.id) {
          setServerError(res.error || 'Failed to create cover letter.')
          return
        }
        router.push(`/dashboard/cover-letters/${res.id}/edit`)
      }
    })
  }

  const isBusy = isSubmitting || isPending

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Top Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/cover-letters"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Back to Cover Letters"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-slate-900 sm:text-2xl">
              {isEditing ? `Edit: ${watchedValues.title || 'Untitled'}` : 'New Cover Letter'}
            </h1>
            <p className="line-clamp-1 text-xs text-slate-500 sm:text-sm">
              Craft a tailored job application letter with live preview, auto-fill, and instant export.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto sm:items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-9 gap-1.5 text-xs justify-center"
            title="Copy plain text to clipboard"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
            {copied ? 'Copied!' : 'Copy Text'}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="h-9 gap-1.5 text-xs justify-center"
            title="Download formatted A4 PDF"
          >
            {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5 text-slate-500" />}
            Download PDF
          </Button>

          <Button
            type="submit"
            disabled={isBusy}
            className="col-span-2 sm:col-span-1 h-9 gap-1.5 text-xs justify-center"
          >
            {isBusy ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                {isEditing ? 'Save Changes' : 'Create Letter'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {serverError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 space-y-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <p className="font-semibold">{serverError}</p>
          </div>
          {(serverError.includes('cover_letters') || serverError.includes('schema cache')) && (
            <div className="mt-2 rounded-md border border-red-300 bg-white p-3 text-xs space-y-2.5 text-slate-700">
              <p className="font-medium text-slate-900">
                {language === 'en'
                  ? 'The database table "cover_letters" has not been created yet in your Supabase project.'
                  : 'Tabel database "cover_letters" belum dibuat di proyek Supabase Anda.'}
              </p>
              <p className="text-slate-600">
                {language === 'en'
                  ? 'Click the button below to copy the migration SQL, then paste & run it in Supabase SQL Editor:'
                  : 'Klik tombol di bawah untuk menyalin skrip SQL migrasi, lalu paste & jalankan di Supabase SQL Editor:'}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCopySQLMigration}
                  className="gap-1.5 text-xs bg-slate-900 text-white hover:bg-slate-800 hover:text-white"
                >
                  {copiedSQL ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedSQL
                    ? (language === 'en' ? 'SQL Copied!' : 'SQL Berhasil Disalin!')
                    : (language === 'en' ? 'Copy Migration SQL' : 'Salin Skrip SQL Migrasi')}
                </Button>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium ml-1"
                >
                  {language === 'en' ? 'Open Supabase Dashboard →' : 'Buka Supabase Dashboard →'}
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {successMessage && (
        <div role="alert" className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <p>{successMessage}</p>
        </div>
      )}

      {/* Mobile Tab Switcher */}
      <div className="sticky top-16 z-20 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-100/95 p-1 backdrop-blur-sm lg:hidden shadow-xs">
        <button
          type="button"
          onClick={() => setMobileTab('form')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2.5 text-xs font-semibold transition-all ${
            mobileTab === 'form' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Edit3 className="h-3.5 w-3.5" />
          Editor Form
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('preview')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2.5 text-xs font-semibold transition-all ${
            mobileTab === 'preview' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          Live Preview
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Form Column (7 cols) */}
        <div className={`space-y-6 ${mobileTab === 'preview' ? 'hidden lg:block' : 'block'} lg:col-span-7`}>
          {/* Document Title & Template Picker */}
          <Card className="border-stone-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900">Document Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="title" className="text-sm font-medium text-slate-700">
                  Document Title / Identifier <span className="text-red-500">*</span>
                </label>
                <Input
                  id="title"
                  placeholder="e.g. Lamaran Backend Developer - PT Tokopedia"
                  {...register('title', {
                    onChange: () => {
                      isTitleEditedRef.current = true
                    },
                  })}
                />
                {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
              </div>

              {/* Template Picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Select Template Format</label>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {COVER_LETTER_TEMPLATES.map((tmpl) => {
                    const isSelected = currentTemplate === tmpl.id
                    return (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => handleSelectTemplate(tmpl.id)}
                        className={`group flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all relative ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                        }`}
                      >
                        <div className="w-full">
                          <div className="mb-2 flex w-full items-center justify-between gap-2">
                            <span
                              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                                isSelected
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                              }`}
                            >
                              {tmpl.badge}
                            </span>
                            <span
                              className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-xs transition-colors ${
                                isSelected ? 'text-blue-600' : 'text-slate-300'
                              }`}
                            >
                              {isSelected ? (
                                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                              ) : (
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-300 group-hover:bg-slate-400" />
                              )}
                            </span>
                          </div>

                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                            {tmpl.name}
                          </h4>
                          <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500 line-clamp-2">
                            {tmpl.description}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Auto-Fill from existing CV */}
              {availableCVs.length > 0 && (
                <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3">
                  <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
                      <span className="text-xs font-semibold text-blue-950">Auto-Fill from your CV:</span>
                    </div>

                    <div className="flex w-full sm:w-auto items-center gap-2">
                      <select
                        value={selectedCvId}
                        onChange={(e) => setSelectedCvId(e.target.value)}
                        className="h-9 flex-1 sm:w-56 rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Choose a CV profile...</option>
                        {availableCVs.map((cv) => (
                          <option key={cv.id} value={cv.id}>
                            {cv.name}
                          </option>
                        ))}
                      </select>

                      <Button
                        type="button"
                        size="sm"
                        variant="default"
                        onClick={handleImportFromCV}
                        disabled={!selectedCvId}
                        className="h-9 px-3 text-xs bg-blue-600 hover:bg-blue-700 shrink-0"
                      >
                        Import
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Target Opportunity Details */}
          <Card className="border-stone-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900">Job & Company Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="job_title" className="text-sm font-medium text-slate-700">
                    Target Position / Job Title <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input id="job_title" placeholder="e.g. Backend Developer" className="pl-9" {...register('job_title')} />
                  </div>
                  {errors.job_title && <p className="text-xs text-red-600">{errors.job_title.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="company_name" className="text-sm font-medium text-slate-700">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input id="company_name" placeholder="e.g. PT Tokopedia" className="pl-9" {...register('company_name')} />
                  </div>
                  {errors.company_name && <p className="text-xs text-red-600">{errors.company_name.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="recipient_name" className="text-sm font-medium text-slate-700">
                    Recipient / HRD Name
                  </label>
                  <Input id="recipient_name" placeholder="e.g. Bapak/Ibu HRD or Hiring Team" {...register('recipient_name')} />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="source" className="text-sm font-medium text-slate-700">
                    Job Source
                  </label>
                  <Input id="source" placeholder="e.g. LinkedIn, JobStreet" {...register('source')} />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="letter_date" className="text-sm font-medium text-slate-700">
                    Letter Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input id="letter_date" type="date" className="pl-9" {...register('letter_date')} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="company_address" className="text-sm font-medium text-slate-700">
                    Company Address / City
                  </label>
                  <Input id="company_address" placeholder="e.g. Jakarta Selatan" {...register('company_address')} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Applicant Contact Details */}
          <Card className="border-stone-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900">Your Contact Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="sender_name" className="text-sm font-medium text-slate-700">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input id="sender_name" placeholder="e.g. Nadia Putri" className="pl-9" {...register('sender_name')} />
                  </div>
                  {errors.sender_name && <p className="text-xs text-red-600">{errors.sender_name.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="sender_email" className="text-sm font-medium text-slate-700">
                    Your Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input id="sender_email" type="email" placeholder="you@example.com" className="pl-9" {...register('sender_email')} />
                  </div>
                  {errors.sender_email && <p className="text-xs text-red-600">{errors.sender_email.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="sender_phone" className="text-sm font-medium text-slate-700">
                    Your Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input id="sender_phone" type="tel" placeholder="e.g. +62 812-3456-7890" className="pl-9" {...register('sender_phone')} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="sender_location" className="text-sm font-medium text-slate-700">
                    Your City / Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input id="sender_location" placeholder="e.g. Jakarta, Indonesia" className="pl-9" {...register('sender_location')} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Letter Paragraphs Editor */}
          <Card className="border-stone-300">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Letter Content</CardTitle>
                <CardDescription>Customize opening, main body, and closing statements.</CardDescription>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleRegenerate}
                className="gap-1.5 text-xs text-slate-700"
                title="Reset paragraphs with template defaults"
              >
                <RefreshCw className="h-3 w-3" />
                Reset Text
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="opening" className="text-sm font-medium text-slate-700">
                  Opening Paragraph <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="opening"
                  rows={3}
                  className="w-full rounded-md border border-slate-300 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  {...register('opening', {
                    onChange: () => {
                      isUserEditedRef.current = true
                    },
                  })}
                />
                {errors.opening && <p className="text-xs text-red-600">{errors.opening.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="body" className="text-sm font-medium text-slate-700">
                  Main Body & Qualifications <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="body"
                  rows={5}
                  className="w-full rounded-md border border-slate-300 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  {...register('body', {
                    onChange: () => {
                      isUserEditedRef.current = true
                    },
                  })}
                />
                {errors.body && <p className="text-xs text-red-600">{errors.body.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="closing" className="text-sm font-medium text-slate-700">
                  Closing Paragraph & Call to Action <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="closing"
                  rows={3}
                  className="w-full rounded-md border border-slate-300 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  {...register('closing', {
                    onChange: () => {
                      isUserEditedRef.current = true
                    },
                  })}
                />
                {errors.closing && <p className="text-xs text-red-600">{errors.closing.message}</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview Column (5 cols) */}
        <div className={`lg:col-span-5 ${mobileTab === 'form' ? 'hidden lg:block' : 'block'}`}>
          <div className="space-y-3 lg:sticky lg:top-24">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Live Document Preview
              </span>
              <Badge variant="outline" className="text-[11px] capitalize">
                {currentTemplate.replace('_', ' ')}
              </Badge>
            </div>

            {/* Document Paper Mockup */}
            <div className="rounded-xl border border-stone-300 bg-white p-4 sm:p-6 md:p-8 shadow-md text-xs leading-relaxed text-slate-800 space-y-4 max-h-none lg:max-h-[calc(100vh-160px)] overflow-y-visible lg:overflow-y-auto">
              {/* Letter Header */}
              <div className="border-b border-blue-600 pb-3">
                <h3 className="text-base font-bold text-slate-900">{watchedValues.sender_name || (isEn ? 'Your Full Name' : 'Nama Lengkap')}</h3>
                <p className="text-[11px] text-slate-500">
                  {[watchedValues.sender_email, watchedValues.sender_phone, watchedValues.sender_location]
                    .filter(Boolean)
                    .join(' • ')}
                </p>
              </div>

              {/* Date & Recipient */}
              <div className="space-y-2 text-[11px]">
                <p className="text-slate-600">
                  {watchedValues.sender_location ? `${watchedValues.sender_location.split(',')[0].trim()}, ` : ''}
                  {formatCoverLetterDate(watchedValues.letter_date, isEn ? 'en' : 'id') || new Date().toISOString().split('T')[0]}
                </p>
                <div>
                  <p className="text-slate-500">
                    {isEn ? 'To:' : 'Kepada Yth.'}
                  </p>
                  <p className="font-bold text-slate-900">
                    {watchedValues.recipient_name || (isEn ? 'Hiring Team' : 'Bapak/Ibu HRD')}
                  </p>
                  <p className="font-semibold text-blue-700">{watchedValues.company_name || (isEn ? 'Company Name' : 'Nama Perusahaan')}</p>
                  {watchedValues.company_address && <p className="text-slate-600">{watchedValues.company_address}</p>}
                </div>
              </div>

              {/* Subject */}
              <div className="border-b border-slate-200 pb-1 font-bold text-slate-900">
                {isEn
                  ? `Subject: Application for ${watchedValues.job_title || 'Position'}`
                  : `Hal: Permohonan Lamaran Kerja — ${watchedValues.job_title || 'Posisi'}`}
              </div>

              {/* Opening */}
              <p className="whitespace-pre-line text-justify text-slate-700">
                {substituteCoverLetterTokens(watchedValues.opening || '', {
                  jobTitle: watchedJobTitle,
                  companyName: watchedCompanyName,
                  senderName: watchedSenderName,
                  recipientName: watchedRecipientName,
                  source: watchedSource,
                })}
              </p>

              {/* Data Diri Box for Formal ID */}
              {((currentTemplate === 'formal_id' || !currentTemplate) && !isEn) && (
                <div className="rounded-md border-l-2 border-blue-600 bg-slate-50 p-2.5 text-[11px] space-y-0.5">
                  <p className="font-semibold text-slate-800">Data Diri Singkat:</p>
                  <p>Nama: {watchedValues.sender_name || '-'}</p>
                  <p>Email: {watchedValues.sender_email || '-'}</p>
                  {watchedValues.sender_phone && <p>Telepon: {watchedValues.sender_phone}</p>}
                  {watchedValues.sender_location && <p>Lokasi: {watchedValues.sender_location}</p>}
                </div>
              )}

              {/* Body */}
              <p className="whitespace-pre-line text-justify text-slate-700">
                {substituteCoverLetterTokens(watchedValues.body || '', {
                  jobTitle: watchedJobTitle,
                  companyName: watchedCompanyName,
                  senderName: watchedSenderName,
                  recipientName: watchedRecipientName,
                  source: watchedSource,
                })}
              </p>

              {/* Closing */}
              <p className="whitespace-pre-line text-justify text-slate-700">
                {substituteCoverLetterTokens(watchedValues.closing || '', {
                  jobTitle: watchedJobTitle,
                  companyName: watchedCompanyName,
                  senderName: watchedSenderName,
                  recipientName: watchedRecipientName,
                  source: watchedSource,
                })}
              </p>

              {/* Sign Off */}
              <div className="pt-4 text-[11px]">
                <p className="text-slate-600">
                  {isEn ? 'Sincerely,' : 'Hormat saya,'}
                </p>
                <p className="mt-8 font-bold text-slate-900">{watchedValues.sender_name || (isEn ? 'Applicant Name' : 'Nama Pelamar')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
