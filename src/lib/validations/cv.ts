import { z } from 'zod'

const PLACEHOLDER_WORDS = new Set([
  'asdf',
  'contoh',
  'dummy',
  'loremipsum',
  'qwerty',
  'sample',
  'test',
  'testing',
])

function looksLikeRealText(value: string): boolean {
  const compact = value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')
  if (!/\p{L}/u.test(compact) || PLACEHOLDER_WORDS.has(compact)) return false

  // Reject obvious repeated filler such as "sadsadsadsad" without guessing at real prose.
  for (let start = 0; start < 3; start += 1) {
    for (let size = 1; size <= 4; size += 1) {
      const candidate = compact.slice(start)
      const unit = candidate.slice(0, size)
      if (candidate.length >= size * 3 && candidate.split(unit).join('').length <= 2) return false
    }
  }

  return true
}

function requiredText(label: string, min = 2, max = 100) {
  return z.string().trim()
    .min(min, `${label} must be at least ${min} characters`)
    .max(max, `${label} must be ${max} characters or fewer`)
    .refine(looksLikeRealText, `Enter a real ${label.toLowerCase()}, not placeholder or repeated text`)
}

function optionalText(label: string, min = 2, max = 160) {
  return z.string().trim()
    .max(max, `${label} must be ${max} characters or fewer`)
    .refine((value) => !value || value.length >= min, `${label} must be at least ${min} characters`)
    .refine((value) => !value || looksLikeRealText(value), `Enter real ${label.toLowerCase()}, not placeholder or repeated text`)
    .optional()
}

function longText(label: string, min: number, max: number) {
  return z.string().trim()
    .max(max, `${label} must be ${max} characters or fewer`)
    .refine((value) => !value || value.length >= min, `${label} must be at least ${min} characters`)
    .refine(
      (value) => !value || value.split(/\s+/).filter(Boolean).length >= 4,
      `${label} must contain at least 4 words`
    )
    .refine((value) => !value || looksLikeRealText(value), `Enter a real ${label.toLowerCase()}, not placeholder or repeated text`)
    .optional()
}

function isHttpUrl(value: string): boolean {
  if (!value) return true
  try {
    const url = new URL(value)
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname.includes('.')
  } catch {
    return false
  }
}

const optionalUrl = (label: string) => z.string().trim()
  .max(300, `${label} is too long`)
  .refine(isHttpUrl, `${label} must be a complete http:// or https:// URL`)
  .optional()

const socialUrl = (label: string, domain: string) => optionalUrl(label).refine((value) => {
  if (!value) return true
  try {
    const hostname = new URL(value).hostname.toLocaleLowerCase()
    return hostname === domain || hostname.endsWith(`.${domain}`)
  } catch {
    return false
  }
}, `${label} must use ${domain}`)

const optionalDate = z.string().trim()
  .refine((value) => !value || /^\d{4}-\d{2}(?:-\d{2})?$/.test(value), 'Use a valid date')
  .nullable()
  .optional()

function validateDateRange(
  data: { start_date?: string | null; end_date?: string | null },
  context: z.RefinementCtx
) {
  if (data.start_date && data.end_date && data.end_date < data.start_date) {
    context.addIssue({
      code: 'custom',
      path: ['end_date'],
      message: 'End date cannot be earlier than start date',
    })
  }
}

export const personalInfoSchema = z.object({
  full_name: requiredText('Full name', 2, 100),
  professional_title: optionalText('Professional title', 2, 100),
  email: z.string().trim().email('Please enter a valid email address').max(254, 'Email address is too long'),
  phone: z.string().trim()
    .max(25, 'Phone number is too long')
    .refine((value) => !value || /^[+()\d\s.-]+$/.test(value), 'Phone number contains invalid characters')
    .refine((value) => !value || value.replace(/\D/g, '').length >= 7, 'Phone number must contain at least 7 digits')
    .optional(),
  location: optionalText('Location', 2, 120),
  linkedin: socialUrl('LinkedIn URL', 'linkedin.com'),
  github: socialUrl('GitHub URL', 'github.com'),
  portfolio: optionalUrl('Portfolio URL'),
  photo_url: optionalUrl('Photo URL').nullable(),
})

export const experienceSchema = z.object({
  id: z.string().optional(),
  company: requiredText('Company name', 2, 120),
  position: requiredText('Position', 2, 120),
  location: optionalText('Location', 2, 120),
  start_date: z.string().trim().min(1, 'Start date is required').refine(
    (value) => /^\d{4}-\d{2}(?:-\d{2})?$/.test(value),
    'Use a valid start date'
  ),
  end_date: optionalDate,
  is_current: z.boolean().default(false),
  description: longText('Experience description', 24, 1200),
  sort_order: z.number().int().default(0),
}).superRefine((data, context) => {
  if (!data.is_current && !data.end_date) {
    context.addIssue({ code: 'custom', path: ['end_date'], message: 'End date is required unless this is your current role' })
  }
  validateDateRange(data, context)
})

export const educationSchema = z.object({
  id: z.string().optional(),
  institution: requiredText('Institution', 2, 160),
  degree: optionalText('Degree', 2, 120),
  field_of_study: optionalText('Field of study', 2, 120),
  start_date: optionalDate,
  end_date: optionalDate,
  description: longText('Education description', 16, 800),
  sort_order: z.number().int().default(0),
}).superRefine(validateDateRange)

export const projectSchema = z.object({
  id: z.string().optional(),
  name: requiredText('Project name', 2, 160),
  description: longText('Project description', 24, 1200),
  project_url: optionalUrl('Project URL'),
  start_date: optionalDate,
  end_date: optionalDate,
  sort_order: z.number().int().default(0),
}).superRefine(validateDateRange)

export const certificationSchema = z.object({
  id: z.string().optional(),
  name: requiredText('Certification name', 2, 160),
  issuer: optionalText('Issuing organization', 2, 160),
  issue_date: optionalDate,
  credential_url: optionalUrl('Credential URL'),
  sort_order: z.number().int().default(0),
})

export const cvSchema = z.object({
  name: requiredText('CV name', 3, 100),
  template: z.enum(['ats', 'professional', 'modern']),
  personal_info: personalInfoSchema,
  summary: longText('Professional summary', 40, 1200).nullable(),
  skills: z.array(requiredText('Skill', 2, 60))
    .max(30, 'Add no more than 30 skills')
    .refine(
      (skills) => new Set(skills.map((skill) => skill.toLocaleLowerCase())).size === skills.length,
      'Remove duplicate skills'
    )
    .default([]),
  experiences: z.array(experienceSchema).max(20, 'Add no more than 20 experiences').default([]),
  educations: z.array(educationSchema).max(20, 'Add no more than 20 education entries').default([]),
  projects: z.array(projectSchema).max(20, 'Add no more than 20 projects').default([]),
  certifications: z.array(certificationSchema).max(20, 'Add no more than 20 certifications').default([]),
})

export type PersonalInfoInput = z.infer<typeof personalInfoSchema>
export type ExperienceInput = z.infer<typeof experienceSchema>
export type EducationInput = z.infer<typeof educationSchema>
export type ProjectInput = z.infer<typeof projectSchema>
export type CertificationInput = z.infer<typeof certificationSchema>
export type CVInput = z.infer<typeof cvSchema>
