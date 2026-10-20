'use client'

import React, { useEffect, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Check, Download, Loader2 } from 'lucide-react'
import { pdf } from '@react-pdf/renderer'
import type { CoverLetter, CoverLetterTemplate } from '@/types/cover-letter'
import type { CV } from '@/types/cv'
import { coverLetterSchema, type CoverLetterFormValues } from '@/lib/validations/cover-letter'
import {
  COVER_LETTER_TEMPLATES,
  detectLetterLanguage,
  formatCoverLetterDate,
  formatCoverLetterPlaintext,
  generateTemplateContent,
  getCoverLetterLanguage,
  isFixedLanguageTemplate,
  substituteCoverLetterTokens,
} from '@/lib/cover-letter/templates'
import { resolveDocumentLanguage } from '@/lib/cv/document'
import { useLanguage } from '@/components/i18n/language-provider'
import { CoverLetterPDFDocument } from '@/lib/cover-letter/pdf'
import { triggerDownload } from '@/lib/pdf/generator'
import { createCoverLetter, updateCoverLetter } from '@/lib/cover-letter/actions'
import { EditorSection, Field, Textarea } from '@/components/cv/editor/fields'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type LetterLanguage = 'id' | 'en'

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

-- RLS
alter table public.cover_letters enable row level security;

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

const LANGUAGE_OPTIONS: { id: LetterLanguage; label: string }[] = [
  { id: 'id', label: 'Bahasa Indonesia' },
  { id: 'en', label: 'English' },
]

const selectClass =
  'h-10 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-950 transition-colors hover:border-stone-400 focus-visible:border-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800/20'

function localToday() {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
}

interface CoverLetterFormProps {
  initialData?: CoverLetter | null
  availableCVs?: CV[]
  userProfile?: {
    full_name?: string | null
    email?: string
  }
}

export function CoverLetterForm({ initialData, availableCVs = [], userProfile }: CoverLetterFormProps) {
  const router = useRouter()
  const { language: uiLanguage } = useLanguage()
  const [isPending, startTransition] = useTransition()
  const [isExporting, setIsExporting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedSQL, setCopiedSQL] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form')
  const [selectedCvId, setSelectedCvId] = useState<string>(initialData?.cv_id || '')
  const [skillsSummary, setSkillsSummary] = useState('')

  const isEditing = Boolean(initialData?.id)
  const isUserEditedRef = useRef(Boolean(isEditing || initialData?.opening))
  const isTitleEditedRef = useRef(Boolean(isEditing || initialData?.title))

  // The letter's language belongs to the letter, not to the app UI. Fixed formats decide it;
  // for the others, read it from the existing text (no DB column) or start from the UI language.
  const [letterLang, setLetterLang] = useState<LetterLanguage>(() => {
    const fallback: LetterLanguage = uiLanguage === 'en' ? 'en' : 'id'
    if (!initialData) return fallback
    if (isFixedLanguageTemplate(initialData.template)) return getCoverLetterLanguage(initialData.template, fallback)
    return detectLetterLanguage(`${initialData.opening} ${initialData.body} ${initialData.closing}`, fallback)
  })

  const defaultValues: CoverLetterFormValues = {
    title: initialData?.title || (letterLang === 'en' ? 'Job application letter' : 'Surat lamaran pekerjaan'),
    template: initialData?.template || (letterLang === 'en' ? 'professional_en' : 'formal_id'),
    job_title: initialData?.job_title || '',
    company_name: initialData?.company_name || '',
    company_address: initialData?.company_address || '',
    recipient_name: initialData?.recipient_name || '',
    source: initialData?.source || '',
    letter_date: initialData?.letter_date || localToday(),
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

  const values = watch()
  const currentTemplate = values.template
  const docLang = getCoverLetterLanguage(currentTemplate, letterLang)
  const isEn = docLang === 'en'
  const languageLocked = isFixedLanguageTemplate(currentTemplate)

  const tokens = {
    jobTitle: values.job_title || '',
    companyName: values.company_name || '',
    recipientName: values.recipient_name || '',
    senderName: values.sender_name || '',
    source: values.source || '',
  }

  const generate = (overrides: { template?: CoverLetterTemplate; senderName?: string; skills?: string; lang?: LetterLanguage } = {}) => {
    const generated = generateTemplateContent({
      template: overrides.template ?? currentTemplate,
      jobTitle: values.job_title || undefined,
      companyName: values.company_name || undefined,
      recipientName: values.recipient_name || undefined,
      source: values.source || undefined,
      senderName: overrides.senderName ?? (values.sender_name || undefined),
      skillsSummary: (overrides.skills ?? skillsSummary) || undefined,
      language: overrides.lang ?? letterLang,
    })
    setValue('opening', generated.opening)
    setValue('body', generated.body)
    setValue('closing', generated.closing)
  }

  // Keep generated text in sync with job details until the user edits a paragraph.
  // After that, only fill placeholders like [Company Name] that are still in the text.
  useEffect(() => {
    if (!isUserEditedRef.current) {
      generate()
      return
    }
    for (const key of ['opening', 'body', 'closing'] as const) {
      const current = values[key] || ''
      const next = substituteCoverLetterTokens(current, tokens)
      if (next !== current) setValue(key, next)
    }
  }, [values.job_title, values.company_name, values.recipient_name, values.source, values.sender_name, currentTemplate, skillsSummary, letterLang]) // eslint-disable-line react-hooks/exhaustive-deps

  // Suggest a document title until the user types their own.
  useEffect(() => {
    if (isTitleEditedRef.current || isEditing) return
    const role = values.job_title?.trim()
    const company = values.company_name?.trim()
    if (role || company) {
      const position = role || (isEn ? 'Position' : 'Posisi')
      setValue('title', `${isEn ? 'Application for' : 'Lamaran'} ${position}${company ? ` - ${company}` : ''}`)
    } else {
      setValue('title', isEn ? 'Job application letter' : 'Surat lamaran pekerjaan')
    }
  }, [values.job_title, values.company_name, isEn, isEditing, setValue])

  const handleSelectTemplate = (template: CoverLetterTemplate) => {
    if (template === currentTemplate) return
    const hasEdits = isUserEditedRef.current && Boolean(values.body?.trim())
    if (hasEdits && !window.confirm('Switching the format replaces the letter text with the new format. Continue?')) return
    setValue('template', template)
    isUserEditedRef.current = false
    generate({ template, lang: getCoverLetterLanguage(template, letterLang) })
  }

  const handleSelectLanguage = (lang: LetterLanguage) => {
    if (lang === letterLang) return
    const hasEdits = isUserEditedRef.current && Boolean(values.body?.trim())
    if (hasEdits && !window.confirm('Changing the language rewrites the letter text from the template. Continue?')) return
    setLetterLang(lang)
    isUserEditedRef.current = false
    generate({ lang })
  }

  const handleRegenerate = () => {
    if (isUserEditedRef.current && !window.confirm('Replace your edited paragraphs with the template text?')) return
    isUserEditedRef.current = false
    generate()
  }

  const handleImportFromCV = () => {
    const sourceCV = availableCVs.find((c) => c.id === selectedCvId)
    if (!sourceCV) return
    const info = sourceCV.personal_info
    setValue('cv_id', sourceCV.id)
    if (info?.full_name) setValue('sender_name', info.full_name)
    if (info?.email) setValue('sender_email', info.email)
    if (info?.phone) setValue('sender_phone', info.phone)
    if (info?.location) setValue('sender_location', info.location)

    const topSkills = (sourceCV.skills || []).slice(0, 4).join(', ')
    setSkillsSummary(topSkills)

    // A CV written in English usually goes with an English letter.
    let lang = letterLang
    if (!languageLocked) {
      lang = resolveDocumentLanguage(info?.document_language)
      setLetterLang(lang)
    }
    if (!isUserEditedRef.current) generate({ senderName: info?.full_name || undefined, skills: topSkills, lang })
  }

  const getSanitizedLetter = (): CoverLetterFormValues => {
    const vals = values
    return {
      ...vals,
      opening: substituteCoverLetterTokens(vals.opening || '', tokens),
      body: substituteCoverLetterTokens(vals.body || '', tokens),
      closing: substituteCoverLetterTokens(vals.closing || '', tokens),
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatCoverLetterPlaintext(getSanitizedLetter(), docLang))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setServerError('Your browser blocked clipboard access. Select the text in the preview and copy it manually.')
    }
  }

  const handleDownloadPDF = async () => {
    setIsExporting(true)
    try {
      const letter = getSanitizedLetter()
      const blob = await pdf(<CoverLetterPDFDocument letter={letter} language={docLang} />).toBlob()
      const name = (letter.sender_name || (isEn ? 'Cover-Letter' : 'Surat-Lamaran')).replace(/\s+/g, '-')
      const company = (letter.company_name || '').replace(/\s+/g, '-')
      triggerDownload(URL.createObjectURL(blob), `${name}${isEn ? '-Cover-Letter' : '-Surat-Lamaran'}${company ? `-${company}` : ''}.pdf`)
    } catch (err) {
      console.error('PDF export failed:', err)
      setServerError('The PDF could not be generated. Try again, or copy the text instead.')
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
      // Clipboard blocked; the SQL is also in supabase/migrations.
    }
  }

  const onSubmit = (formValues: CoverLetterFormValues) => {
    setServerError(null)
    const clean: CoverLetterFormValues = {
      ...formValues,
      opening: substituteCoverLetterTokens(formValues.opening || '', tokens),
      body: substituteCoverLetterTokens(formValues.body || '', tokens),
      closing: substituteCoverLetterTokens(formValues.closing || '', tokens),
    }
    startTransition(async () => {
      if (isEditing && initialData?.id) {
        const res = await updateCoverLetter(initialData.id, clean)
        if (!res.success) {
          setServerError(res.error || 'Could not save the letter.')
          return
        }
        setSavedAt(new Date())
        router.refresh()
      } else {
        const res = await createCoverLetter(clean)
        if (!res.success || !res.id) {
          setServerError(res.error || 'Could not create the letter.')
          return
        }
        router.push(`/dashboard/cover-letters/${res.id}/edit`)
      }
    })
  }

  const isBusy = isSubmitting || isPending
  const missingTable = Boolean(serverError && (serverError.includes('cover_letters') || serverError.includes('schema cache')))
  const markEdited = {
    onChange: () => {
      isUserEditedRef.current = true
    },
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="flex flex-col gap-4 border-b border-stone-300 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <Link
            href="/dashboard/cover-letters"
            className="inline-flex items-center gap-1 rounded text-sm font-medium text-stone-600 hover:text-stone-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Cover letters
          </Link>
          <h1 className="mt-1 truncate text-2xl font-semibold text-stone-950">
            {isEditing ? values.title || 'Untitled letter' : 'New cover letter'}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs text-stone-500" aria-live="polite">
            {savedAt ? (
              <>
                <span>Saved at</span> {savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </>
            ) : null}
          </span>
          <Button type="button" variant="outline" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
            {copied ? 'Copied' : 'Copy text'}
          </Button>
          <Button type="button" variant="outline" onClick={handleDownloadPDF} disabled={isExporting}>
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Download className="h-4 w-4" aria-hidden="true" />}
            PDF
          </Button>
          <Button type="submit" disabled={isBusy}>
            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {isBusy ? 'Saving' : isEditing ? 'Save' : 'Create letter'}
          </Button>
        </div>
      </div>

      {serverError ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p className="font-medium">{serverError}</p>
          {missingTable ? (
            <div className="mt-3 space-y-2 text-stone-700">
              <p>
                The cover_letters table does not exist in your Supabase project yet. Copy the migration and run it in the Supabase SQL editor.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button type="button" size="sm" variant="outline" onClick={handleCopySQLMigration}>
                  {copiedSQL ? 'SQL copied' : 'Copy migration SQL'}
                </Button>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-blue-800 underline-offset-4 hover:underline"
                >
                  Open Supabase dashboard<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div role="tablist" aria-label="Editor view" className="grid grid-cols-2 rounded-lg border border-stone-200 bg-stone-100 p-1 lg:hidden">
        {(['form', 'preview'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={mobileTab === tab}
            onClick={() => setMobileTab(tab)}
            className={`rounded-md py-2 text-sm font-semibold transition-colors ${mobileTab === tab ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-600 hover:text-stone-950'}`}
          >
            {tab === 'form' ? 'Edit' : 'Preview'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)]">
        <div className={`space-y-5 ${mobileTab === 'preview' ? 'hidden lg:block' : ''}`}>
          <EditorSection title="Format">
            <fieldset>
              <legend className="sr-only">Letter format</legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {COVER_LETTER_TEMPLATES.map((tmpl) => {
                  const selected = currentTemplate === tmpl.id
                  return (
                    <label
                      key={tmpl.id}
                      className={`cursor-pointer rounded-lg border px-3.5 py-3 text-left transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-700 ${
                        selected ? 'border-blue-700 bg-blue-50/60 ring-1 ring-blue-700' : 'border-stone-200 bg-white hover:border-stone-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="letter-format"
                        value={tmpl.id}
                        checked={selected}
                        onChange={() => handleSelectTemplate(tmpl.id)}
                        className="sr-only"
                      />
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-semibold text-stone-950">{tmpl.name}</span>
                        <span className="text-xs text-stone-500">{tmpl.badge}</span>
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-stone-600">{tmpl.description}</span>
                    </label>
                  )
                })}
              </div>
            </fieldset>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                id="letter_language"
                label="Letter language"
                hint={languageLocked ? 'Set by the format you chose.' : 'Changes the greeting, date format and sign-off.'}
              >
                <select
                  id="letter_language"
                  value={docLang}
                  disabled={languageLocked}
                  onChange={(event) => handleSelectLanguage(event.target.value as LetterLanguage)}
                  className={`${selectClass} disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-500`}
                >
                  {LANGUAGE_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="title" label="Name in your list" required error={errors.title?.message} hint="Only you see this.">
                <Input
                  id="title"
                  {...register('title', {
                    onChange: () => {
                      isTitleEditedRef.current = true
                    },
                  })}
                />
              </Field>
            </div>

            {availableCVs.length > 0 ? (
              <div className="flex flex-col gap-2 border-t border-stone-200 pt-4 sm:flex-row sm:items-start">
                <Field id="import_cv" label="Fill your details from a CV" className="flex-1" hint="Copies name, email, phone, city and your top skills.">
                  <select id="import_cv" value={selectedCvId} onChange={(e) => setSelectedCvId(e.target.value)} className={selectClass}>
                    <option value="">Choose a CV</option>
                    {availableCVs.map((cv) => (
                      <option key={cv.id} value={cv.id} data-no-translate>
                        {cv.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Button type="button" variant="outline" onClick={handleImportFromCV} disabled={!selectedCvId} className="sm:mt-7">
                  Fill in
                </Button>
              </div>
            ) : null}
          </EditorSection>

          <EditorSection title="Job">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="job_title" label="Position" required error={errors.job_title?.message}>
                <Input id="job_title" placeholder="Technical Support Engineer" {...register('job_title')} />
              </Field>
              <Field id="company_name" label="Company" required error={errors.company_name?.message}>
                <Input id="company_name" placeholder="Company name" {...register('company_name')} />
              </Field>
              <Field id="recipient_name" label="Addressed to" optional hint={isEn ? 'If empty, the letter says "Hiring Team".' : 'If empty, the letter says "Bapak/Ibu HRD".'}>
                <Input id="recipient_name" {...register('recipient_name')} />
              </Field>
              <Field id="company_address" label="Company city or address" optional>
                <Input id="company_address" {...register('company_address')} />
              </Field>
              <Field id="source" label="Where you found the job" optional hint="LinkedIn, JobStreet, a referral.">
                <Input id="source" {...register('source')} />
              </Field>
              <Field id="letter_date" label="Letter date" required error={errors.letter_date?.message}>
                <Input id="letter_date" type="date" {...register('letter_date')} />
              </Field>
            </div>
          </EditorSection>

          <EditorSection title="Your details">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="sender_name" label="Full name" required error={errors.sender_name?.message}>
                <Input id="sender_name" autoComplete="name" {...register('sender_name')} />
              </Field>
              <Field id="sender_email" label="Email" required error={errors.sender_email?.message}>
                <Input id="sender_email" type="email" autoComplete="email" {...register('sender_email')} />
              </Field>
              <Field id="sender_phone" label="Phone" optional>
                <Input id="sender_phone" type="tel" autoComplete="tel" {...register('sender_phone')} />
              </Field>
              <Field id="sender_location" label="City" optional hint="Printed before the date, e.g. Jakarta, 12 May 2026.">
                <Input id="sender_location" {...register('sender_location')} />
              </Field>
            </div>
          </EditorSection>

          <EditorSection
            title="Letter text"
            description="Generated from the format and your job details until you edit it. Words in [brackets] are replaced when you fill the matching field."
            action={
              <Button type="button" size="sm" variant="outline" onClick={handleRegenerate}>
                Reset to template
              </Button>
            }
          >
            <Field id="opening" label="Opening" required error={errors.opening?.message}>
              <Textarea id="opening" rows={4} {...register('opening', markEdited)} />
            </Field>
            <Field id="body" label="Body" required error={errors.body?.message} hint="Name one or two concrete things you did that match the job.">
              <Textarea id="body" rows={8} {...register('body', markEdited)} />
            </Field>
            <Field id="closing" label="Closing" required error={errors.closing?.message}>
              <Textarea id="closing" rows={4} {...register('closing', markEdited)} />
            </Field>
          </EditorSection>
        </div>

        <div className={mobileTab === 'form' ? 'hidden lg:block' : ''}>
          <div className="space-y-2 lg:sticky lg:top-8">
            <p className="text-sm font-medium text-stone-700">Preview</p>
            <div
              data-no-translate
              lang={docLang}
              className="space-y-4 rounded-md bg-white p-6 shadow-[0_8px_24px_-12px_rgba(28,25,23,0.25)] ring-1 ring-stone-200 font-serif text-[12.5px] leading-relaxed text-stone-900 sm:p-8 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto"
            >
              <div className="border-b border-stone-800 pb-2">
                <p className="text-lg font-bold leading-tight">{values.sender_name || (isEn ? 'Your name' : 'Nama lengkap')}</p>
                <p className="mt-0.5 text-[11.5px] text-stone-600">
                  {[values.sender_email, values.sender_phone, values.sender_location].filter(Boolean).join(' · ')}
                </p>
              </div>

              <div className="space-y-2">
                <p>
                  {values.sender_location ? `${values.sender_location.split(',')[0].trim()}, ` : ''}
                  {formatCoverLetterDate(values.letter_date, docLang)}
                </p>
                <div>
                  <p>{isEn ? 'To:' : 'Kepada Yth.'}</p>
                  <p className="font-semibold">{values.recipient_name || (isEn ? 'Hiring Team' : 'Bapak/Ibu HRD')}</p>
                  <p className="font-semibold">{values.company_name || (isEn ? 'Company name' : 'Nama perusahaan')}</p>
                  {values.company_address ? <p>{values.company_address}</p> : null}
                </div>
              </div>

              <p className="font-semibold">
                {isEn
                  ? `Subject: Application for ${values.job_title || 'the position'}`
                  : `Perihal: Lamaran Pekerjaan sebagai ${values.job_title || 'posisi'}`}
              </p>

              <p className="whitespace-pre-line">{substituteCoverLetterTokens(values.opening || '', tokens)}</p>

              {currentTemplate === 'formal_id' ? (
                <div className="text-[12px]">
                  <p className="font-semibold">Data diri</p>
                <table>
                  <tbody>
                    {[
                      ['Nama', values.sender_name || '-'],
                      ['Email', values.sender_email || '-'],
                      ...(values.sender_phone ? [['Telepon', values.sender_phone]] : []),
                      ...(values.sender_location ? [['Domisili', values.sender_location]] : []),
                    ].map(([label, value]) => (
                      <tr key={label}>
                        <td className="w-24 pr-2 align-top">{label}</td>
                        <td className="pr-2 align-top">:</td>
                        <td>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              ) : null}

              <p className="whitespace-pre-line">{substituteCoverLetterTokens(values.body || '', tokens)}</p>
              <p className="whitespace-pre-line">{substituteCoverLetterTokens(values.closing || '', tokens)}</p>

              <div className="pt-2">
                <p>{isEn ? 'Sincerely,' : 'Hormat saya,'}</p>
                <p className="mt-10 font-semibold">{values.sender_name || (isEn ? 'Your name' : 'Nama lengkap')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
