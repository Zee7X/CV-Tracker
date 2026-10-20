'use client'

import React, { useActionState, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/auth/password-input'
import { EditorSection, Field } from '@/components/cv/editor/fields'
import { updateAccountProfileAction, updateAccountPasswordAction } from '@/lib/account/actions'
import { compressImageFile } from '@/lib/image-utils'
import { LocalDate } from '@/components/i18n/local-date'

interface AccountSettingsFormProps {
  initialProfile: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    created_at?: string | null
  }
}

function Notice({ kind, children }: { kind: 'success' | 'error'; children: React.ReactNode }) {
  return (
    <p
      role={kind === 'error' ? 'alert' : 'status'}
      className={`rounded-md border px-4 py-3 text-sm ${
        kind === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-900'
      }`}
    >
      {children}
    </p>
  )
}

export function AccountSettingsForm({ initialProfile }: AccountSettingsFormProps) {
  const [profileState, profileAction, profilePending] = useActionState(updateAccountProfileAction, undefined)
  const [passwordState, passwordAction, passwordPending] = useActionState(updateAccountPasswordAction, undefined)

  const [avatarUrl, setAvatarUrl] = useState<string>(initialProfile.avatar_url || '')
  const [fullName, setFullName] = useState<string>(initialProfile.full_name || '')
  const [isCompressing, setIsCompressing] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploadError(null)
    setIsCompressing(true)
    try {
      setAvatarUrl(await compressImageFile(file, 320, 0.85))
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'This image could not be read. Try a JPG or PNG.')
    } finally {
      setIsCompressing(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const initials =
    fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || '?'

  return (
    <div className="min-w-0 space-y-6">
      <EditorSection title="Profile" description="Your name is used as the default sender on new cover letters.">
        {profileState?.success ? <Notice kind="success">{profileState.success}</Notice> : null}
        {profileState?.error ? <Notice kind="error">{profileState.error}</Notice> : null}

        <form action={profileAction} className="space-y-5">
          <input type="hidden" name="avatar_url" value={avatarUrl} />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-stone-200 bg-stone-100 text-xl font-semibold text-stone-500">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span aria-hidden="true">{initials}</span>
              )}
              {isCompressing ? (
                <span className="absolute inset-0 flex items-center justify-center bg-white/80">
                  <Loader2 className="h-5 w-5 animate-spin text-stone-600" aria-label="Processing image" />
                </span>
              ) : null}
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-sm font-medium text-stone-800">Photo</p>
              <p className="text-xs text-stone-500">
                {'JPG, PNG or WebP. Resized to 320 px. Only the Modern CV template prints a photo; in the CV editor choose “Use account photo”.'}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarFile}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isCompressing || profilePending}
                >
                  {avatarUrl ? 'Replace photo' : 'Upload photo'}
                </Button>
                {avatarUrl ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setAvatarUrl('')
                      setUploadError(null)
                    }}
                    disabled={profilePending}
                    className="text-red-700 hover:bg-red-50 hover:text-red-800"
                  >
                    Remove
                  </Button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setShowUrlInput((open) => !open)}
                  aria-expanded={showUrlInput}
                  className="rounded px-1 text-xs font-medium text-blue-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800"
                >
                  {showUrlInput ? 'Hide link field' : 'Use an image link instead'}
                </button>
              </div>
              {uploadError ? <p className="text-xs font-medium text-red-700" role="alert">{uploadError}</p> : null}
              {showUrlInput ? (
                <Input
                  aria-label="Image link"
                  type="url"
                  value={avatarUrl.startsWith('data:') ? '' : avatarUrl}
                  onChange={(event) => setAvatarUrl(event.target.value)}
                  placeholder="https://"
                  className="h-9 text-sm"
                />
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="full_name" label="Full name">
              <Input
                id="full_name"
                name="full_name"
                autoComplete="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </Field>
            <Field id="email" label="Email" hint="Used to sign in. It cannot be changed here.">
              <Input
                id="email"
                type="email"
                value={initialProfile.email}
                readOnly
                className="cursor-not-allowed bg-stone-100 text-stone-600"
              />
            </Field>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-stone-200 pt-4">
            <p className="text-xs text-stone-500">
              {initialProfile.created_at ? (
                <>
                  <span>Account created</span> <LocalDate value={initialProfile.created_at} />
                </>
              ) : null}
            </p>
            <Button type="submit" disabled={profilePending || isCompressing}>
              {profilePending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {profilePending ? 'Saving' : 'Save profile'}
            </Button>
          </div>
        </form>
      </EditorSection>

      <EditorSection title="Password">
        {passwordState?.success ? <Notice kind="success">{passwordState.success}</Notice> : null}
        {passwordState?.error ? <Notice kind="error">{passwordState.error}</Notice> : null}

        <form action={passwordAction} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="new_password" label="New password" hint="At least 8 characters.">
              <PasswordInput id="new_password" name="password" autoComplete="new-password" required minLength={8} />
            </Field>
            <Field id="confirm_password" label="Repeat new password">
              <PasswordInput id="confirm_password" name="confirm_password" autoComplete="new-password" required minLength={8} />
            </Field>
          </div>
          <div className="flex justify-end border-t border-stone-200 pt-4">
            <Button type="submit" variant="outline" disabled={passwordPending}>
              {passwordPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {passwordPending ? 'Updating' : 'Change password'}
            </Button>
          </div>
        </form>
      </EditorSection>
    </div>
  )
}
