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
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Reset your password</h1>
        <p className="mt-1 text-sm text-slate-500">
          Enter your email and we&apos;ll send a reset link
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

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href="/login" className="text-blue-600 hover:underline font-medium">
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
