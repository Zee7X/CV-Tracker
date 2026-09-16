import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  full_name: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  email: z.string().trim().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be at most 72 characters'),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
})

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be at most 72 characters'),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

/** Validate that a post-auth redirect target is safe (relative path only). */
export function isSafeRedirect(url: string): boolean {
  if (!url) return false
  // Must start with / and not be a protocol-relative URL (//) or absolute URL
  return url.startsWith('/') && !url.startsWith('//')
}

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
