import type { CVTemplate } from './database'

export type { CVTemplate }

export interface PersonalInfo {
  full_name: string
  professional_title?: string
  email: string
  phone?: string
  location?: string
  linkedin?: string
  github?: string
  portfolio?: string
  photo_url?: string | null
}

export interface Experience {
  id?: string
  cv_id?: string
  company: string
  position: string
  location?: string
  start_date: string
  end_date?: string | null
  is_current: boolean
  description?: string
  sort_order: number
}

export interface Education {
  id?: string
  cv_id?: string
  institution: string
  degree?: string
  field_of_study?: string
  start_date?: string | null
  end_date?: string | null
  description?: string
  sort_order: number
}

export interface Project {
  id?: string
  cv_id?: string
  name: string
  description?: string
  project_url?: string
  start_date?: string | null
  end_date?: string | null
  sort_order: number
}

export interface Certification {
  id?: string
  cv_id?: string
  name: string
  issuer?: string
  issue_date?: string | null
  credential_url?: string
  sort_order: number
}

export interface CV {
  id: string
  user_id: string
  name: string
  template: CVTemplate
  personal_info: PersonalInfo
  summary: string | null
  skills: string[]
  created_at: string
  updated_at: string
}

export interface CVWithRelations extends CV {
  experiences: Experience[]
  educations: Education[]
  projects: Project[]
  certifications: Certification[]
}
