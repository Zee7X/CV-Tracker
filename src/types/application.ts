import type { ApplicationStatus } from './database'
import type { CV } from './cv'

export type { ApplicationStatus }

export const APPLICATION_STATUSES: {
  value: ApplicationStatus
  label: string
  color: string
}[] = [
  { value: 'applied', label: 'Applied', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'screening', label: 'Screening', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'interview', label: 'Interview', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'offering', label: 'Offering', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'accepted', label: 'Accepted', color: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'rejected', label: 'Rejected', color: 'bg-rose-50 text-rose-700 border-rose-200' },
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
