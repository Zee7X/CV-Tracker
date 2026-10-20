'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/auth/password-input'
import { Field, AuthAlert } from '@/components/auth/field'
import { registerAction } from '@/lib/auth/actions'


export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerAction, undefined)
  const done = state && 'success' in state

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.025em] text-stone-900">Create an account</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">Free. You can write your first CV right after signing up.</p>
      </div>

      {done ? (
        <AuthAlert kind="success" message={state.success} />
      ) : (
        <form action={action} className="flex flex-col gap-4" noValidate>
          <Field label="Full name" htmlFor="full_name">
            <Input
              id="full_name"
              name="full_name"
              type="text"
              autoComplete="name"
              required
              placeholder="As it should appear on your CV"
            />
          </Field>

          <Field label="Email address" htmlFor="email">
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
            />
          </Field>

          <Field label="Password" htmlFor="password">
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              required
              placeholder="At least 8 characters"
              minLength={8}
            />
          </Field>

          <Field label="Confirm password" htmlFor="confirm_password">
            <PasswordInput
              id="confirm_password"
              name="confirm_password"
              autoComplete="new-password"
              required
              placeholder="Repeat your password"
            />
          </Field>

          {state && 'error' in state && <AuthAlert kind="error" message={state.error} />}

          <Button type="submit" className="w-full mt-1" disabled={pending} aria-busy={pending}>
            {pending ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
      )}

      <p className="mt-6 text-sm text-stone-600">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-brand-700 underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
