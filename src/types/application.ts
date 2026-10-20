import type { ApplicationStatus } from './database'
import type { CV } from './cv'

export type { ApplicationStatus }

export const APPLICATION_STATUSES: {
  value: ApplicationStatus
  label: string
  color: string
}[] = [
  { value: 'applied', label: 'Applied', color: 'bg-stone-100 text-stone-800 border-stone-300' },
  { value: 'screening', label: 'Screening', color: 'bg-amber-50 text-amber-900 border-amber-200' },
  { value: 'interview', label: 'Interview', color: 'bg-brand-50 text-brand-900 border-brand-200' },
  { value: 'offering', label: 'Offer', color: 'bg-emerald-50 text-emerald-900 border-emerald-200' },
  { value: 'accepted', label: 'Accepted', color: 'bg-emerald-700 text-white border-emerald-700' },
  { value: 'rejected', label: 'Rejected', color: 'bg-white text-stone-500 border-stone-300' },
]

export interface JobApplication {
  id: string
  user_id: string
  cv_id: string | null
  company_name: string
  position: string
  applied_date: string
  status: ApplicationStatus
  job_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface JobApplicationWithCV extends JobApplication {
  cv?: Pick<CV, 'id' | 'name' | 'template'> | null
}
