export type CoverLetterTemplate = 'formal_id' | 'professional_en' | 'email_short' | 'creative'

export interface CoverLetter {
  id: string
  user_id: string
  title: string
  template: CoverLetterTemplate
  job_title: string
  company_name: string
  company_address?: string | null
  recipient_name?: string | null
  source?: string | null
  letter_date: string
  sender_name: string
  sender_email: string
  sender_phone?: string | null
  sender_location?: string | null
  opening: string
  body: string
  closing: string
  cv_id?: string | null
  created_at: string
  updated_at: string
}

export interface CoverLetterInput {
  title: string
  template: CoverLetterTemplate
  job_title: string
  company_name: string
  company_address?: string | null
  recipient_name?: string | null
  source?: string | null
  letter_date: string
  sender_name: string
  sender_email: string
  sender_phone?: string | null
  sender_location?: string | null
  opening: string
  body: string
  closing: string
  cv_id?: string | null
}

