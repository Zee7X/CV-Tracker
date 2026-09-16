import { z } from 'zod'

export const applicationStatusEnum = z.enum([
  'applied',
  'screening',
  'interview',
  'offering',
  'accepted',
  'rejected',
])

export const applicationSchema = z.object({
  company_name: z.string().trim().min(1, 'Company name is required'),
  position: z.string().trim().min(1, 'Position is required'),
  applied_date: z.string().trim().min(1, 'Applied date is required'),
  status: applicationStatusEnum,
  cv_id: z.string().uuid('Invalid CV ID').nullable().optional().or(z.literal('')),
  job_url: z.string().trim().url('Must be a valid URL').or(z.literal('')).optional(),
  notes: z.string().trim().optional().nullable(),
})

export type ApplicationInput = z.infer<typeof applicationSchema>
