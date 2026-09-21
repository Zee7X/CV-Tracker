'use client'

import React, { useActionState, useRef, useState } from 'react'
import {
  User,
  Mail,
  Camera,
  Upload,
  Trash2,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/auth/password-input'
import { updateAccountProfileAction, updateAccountPasswordAction } from '@/lib/account/actions'
import { compressImageFile } from '@/lib/image-utils'

interface AccountSettingsFormProps {
  initialProfile: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    created_at?: string | null
  }
}

export function AccountSettingsForm({ initialProfile }: AccountSettingsFormProps) {
  const [profileState, profileAction, profilePending] = useActionState(
    updateAccountProfileAction,
    undefined
  )
  const [passwordState, passwordAction, passwordPending] = useActionState(
    updateAccountPasswordAction,
    undefined
  )

  const [avatarUrl, setAvatarUrl] = useState<string>(initialProfile.avatar_url || '')
  const [fullName, setFullName] = useState<string>(initialProfile.full_name || '')
  const [isCompressing, setIsCompressing] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)
    setIsCompressing(true)
    try {
      const compressedDataUrl = await compressImageFile(file, 320, 0.85)
      setAvatarUrl(compressedDataUrl)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to process avatar image')
    } finally {
      setIsCompressing(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemoveAvatar = () => {
    setAvatarUrl('')
    setUploadError(null)
  }

  // Format member since date
  const memberSince = initialProfile.created_at
    ? new Date(initialProfile.created_at).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* Left Column: Profile & Password Forms (8 cols) */}
      <div className="space-y-6 lg:col-span-8">
        {/* Profile Information Card */}
        <Card className="border-stone-300 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
              <User className="h-5 w-5 text-blue-600" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your account profile photo, display name, and login email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profileState?.success && (
              <div
                role="alert"
                className="mb-6 flex items-center gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                <span>{profileState.success}</span>
              </div>
            )}

            {profileState?.error && (
              <div
                role="alert"
                className="mb-6 flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
              >
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
                <span>{profileState.error}</span>
              </div>
            )}

            <form action={profileAction} className="space-y-6">
              {/* Hidden Avatar URL input */}
              <input type="hidden" name="avatar_url" value={avatarUrl} />

              {/* Avatar Section */}
              <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-center">
                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-sm">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt={fullName || 'User Avatar'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Camera className="h-8 w-8 stroke-[1.5]" />
                      <span className="mt-1 text-[10px] font-medium text-slate-400">No Photo</span>
                    </div>
                  )}

                  {isCompressing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <h4 className="text-sm font-semibold text-slate-900">Profile Photo / Avatar</h4>
                  <p className="text-xs text-slate-500">
                    JPG, PNG, or WebP. Can be imported directly into your CV templates.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
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
                      className="gap-1.5 text-xs"
                    >
                      <Upload className="h-3.5 w-3.5 text-blue-600" />
                      Upload Avatar
                    </Button>

                    {avatarUrl && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={handleRemoveAvatar}
                        disabled={profilePending}
                        className="gap-1.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </Button>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {showUrlInput ? 'Hide URL input' : 'Paste image URL'}
                    </button>
                  </div>

                  {uploadError && (
                    <p className="text-xs text-red-600" role="alert">
                      {uploadError}
                    </p>
                  )}

                  {showUrlInput && (
                    <div className="mt-2 space-y-1">
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                        <Input
                          value={avatarUrl}
                          onChange={(e) => setAvatarUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/photo-..."
                          className="h-9 pl-8 text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="full_name" className="text-sm font-medium text-slate-700">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="full_name"
                      name="full_name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Nadia Putri"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-slate-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={initialProfile.email}
                      disabled
                      className="bg-slate-100 pl-9 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Primary email address associated with your Supabase account.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={profilePending || isCompressing} className="gap-2">
                  {profilePending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Profile Changes'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Password & Security Card */}
        <Card className="border-stone-300 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
              <Lock className="h-5 w-5 text-blue-600" />
              Password & Security
            </CardTitle>
            <CardDescription>
              Update your account password to keep your CV workspace secure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {passwordState?.success && (
              <div
                role="alert"
                className="mb-6 flex items-center gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                <span>{passwordState.success}</span>
              </div>
            )}

            {passwordState?.error && (
              <div
                role="alert"
                className="mb-6 flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
              >
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
                <span>{passwordState.error}</span>
              </div>
            )}

            <form action={passwordAction} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="new_password" className="text-sm font-medium text-slate-700">
                  New Password
                </label>
                <PasswordInput
                  id="new_password"
                  name="password"
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirm_password" className="text-sm font-medium text-slate-700">
                  Confirm New Password
                </label>
                <PasswordInput
                  id="confirm_password"
                  name="confirm_password"
                  placeholder="Repeat your new password"
                  required
                  minLength={8}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={passwordPending} variant="outline" className="gap-2">
                  {passwordPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Account Context & Sync Info (4 cols) */}
      <div className="space-y-6 lg:col-span-4">
        {/* Account Details Card */}
        <Card className="border-stone-300 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-slate-900">Account Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</p>
                <p className="font-medium text-slate-800 break-all">{initialProfile.email}</p>
              </div>
            </div>

            {memberSince && (
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-4 w-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Member Since</p>
                  <p className="font-medium text-slate-800">{memberSince}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CV Photo Sync Tips Card */}
        <Card className="border-blue-200 bg-blue-50/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-blue-900">
              <Sparkles className="h-4 w-4 text-blue-600" />
              CV Photo Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-blue-800">
            <p>
              Foto avatar yang Anda simpan di sini dapat disinkronkan secara otomatis ke CV Anda saat menggunakan
              template <strong>Modern</strong> atau <strong>Kreatif</strong>.
            </p>
            <p className="text-blue-700">
              Cukup klik tombol <em>&ldquo;Use Account Photo&rdquo;</em> di tab Informasi Pribadi saat mengedit CV.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

