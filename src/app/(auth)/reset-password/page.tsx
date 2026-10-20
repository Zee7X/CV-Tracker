'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/auth/password-input'
import { Field, AuthAlert } from '@/components/auth/field'
import { resetPasswordAction } from '@/lib/auth/actions'


export default function ResetPasswordPage() {
  const [state, action, pending] = useActionState(resetPasswordAction, undefined)

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.025em] text-stone-900">Set a new password</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Use at least 8 characters.
        </p>
      </div>

      <form action={action} className="flex flex-col gap-4" noValidate>
        <Field label="New password" htmlFor="password">
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            required
            placeholder="At least 8 characters"
            minLength={8}
          />
        </Field>

        <Field label="Confirm new password" htmlFor="confirm_password">
          <PasswordInput
            id="confirm_password"
            name="confirm_password"
            autoComplete="new-password"
            required
            placeholder="Repeat your password"
          />
        </Field>

        {state && 'error' in state && <AuthAlert kind="error" message={state.error} />}

        <Button type="submit" className="w-full" disabled={pending} aria-busy={pending}>
          {pending ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </div>
  )
}
