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
    <div className="rounded-lg border border-stone-300 bg-[#fffefa] p-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-stone-950">Create an account</h1>
        <p className="mt-1 text-sm text-stone-600">Start building and tracking your CVs</p>
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
              placeholder="Nadia Putri"
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

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  )
}
