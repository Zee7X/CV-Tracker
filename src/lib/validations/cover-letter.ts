import { z } from 'zod'

export const coverLetterSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Title must be at least 2 characters')
    .max(120, 'Title must be 120 characters or fewer'),
  template: z.enum(['formal_id', 'professional_en', 'email_short', 'creative']),
  job_title: z
    .string()
    .trim()
    .min(2, 'Job position must be at least 2 characters')
    .max(100, 'Job position is too long'),
  company_name: z
    .string()
    .trim()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name is too long'),
  company_address: z.string().trim().max(150, 'Address is too long').optional().nullable(),
  recipient_name: z.string().trim().max(100, 'Recipient name is too long').optional().nullable(),
  source: z.string().trim().max(100, 'Source is too long').optional().nullable(),
  letter_date: z
    .string()
    .trim()
    .refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val), 'Use a valid date (YYYY-MM-DD)'),
  sender_name: z
    .string()
    .trim()
    .min(2, 'Your name must be at least 2 characters')
    .max(100, 'Your name is too long'),
  sender_email: z.string().trim().email('Please enter a valid email address'),
  sender_phone: z.string().trim().max(25, 'Phone number is too long').optional().nullable(),
  sender_location: z.string().trim().max(120, 'Location is too long').optional().nullable(),
  opening: z.string().trim().min(10, 'Opening paragraph must be at least 10 characters'),
  body: z.string().trim().min(20, 'Letter body must be at least 20 characters'),
  closing: z.string().trim().min(10, 'Closing paragraph must be at least 10 characters'),
  cv_id: z.string().uuid().optional().nullable(),
})

export type CoverLetterFormValues = z.infer<typeof coverLetterSchema>
