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
          placeholder="••••••••"
        />
      </Field>

      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-xs text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
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
    <div className="rounded-lg border border-stone-300 bg-[#fffefa] p-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-stone-950">Welcome back</h1>
        <p className="mt-1 text-sm text-stone-600">Sign in to your CV Tracker account</p>
      </div>

      <Suspense>
        <CallbackError />
      </Suspense>

      <LoginForm />

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-blue-600 hover:underline font-medium">
          Create one
        </Link>
      </p>
    </div>
  )
}
