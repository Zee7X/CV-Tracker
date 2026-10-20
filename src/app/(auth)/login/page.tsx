'use client'

import { Suspense } from 'react'
import { useActionState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/auth/password-input'
import { Field, AuthAlert } from '@/components/auth/field'
import { loginAction } from '@/lib/auth/actions'

function CallbackError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  if (!error) return null
  return <AuthAlert kind="error" message="Authentication failed. Please try again." />
}

function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined)

  return (
    <form action={action} className="mt-4 flex flex-col gap-4" noValidate>
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
          autoComplete="current-password"
          required
                  />
      </Field>

      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-sm text-blue-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800 rounded"
        >
          Forgot password?
        </Link>
      </div>

      {state && 'error' in state && <AuthAlert kind="error" message={state.error} />}

      <Button type="submit" className="w-full" disabled={pending} aria-busy={pending}>
        {pending ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-stone-950">Sign in</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">Use the email and password you registered with.</p>
      </div>

      <Suspense>
        <CallbackError />
      </Suspense>

      <LoginForm />

      <p className="mt-6 text-sm text-stone-600">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium text-blue-700 underline-offset-4 hover:underline">
          Create one
        </Link>
      </p>
    </div>
  )
}
