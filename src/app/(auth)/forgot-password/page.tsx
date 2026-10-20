'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, AuthAlert } from '@/components/auth/field'
import { forgotPasswordAction } from '@/lib/auth/actions'


export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(forgotPasswordAction, undefined)
  const done = state && 'success' in state

  return (
    <div className="rounded-lg border border-stone-300 bg-[#fffefa] p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-stone-950">Reset your password</h1>
        <p className="mt-1 text-sm text-stone-600">
          Enter the email you registered with. We will send a link to set a new password.
        </p>
      </div>

      {done ? (
        <AuthAlert kind="success" message={state.success} />
      ) : (
        <form action={action} className="flex flex-col gap-4" noValidate>
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

          {state && 'error' in state && <AuthAlert kind="error" message={state.error} />}

          <Button type="submit" className="w-full" disabled={pending} aria-busy={pending}>
            {pending ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      )}

      <p className="mt-6 text-sm text-stone-600">
        <Link href="/login" className="font-medium text-blue-800 underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
