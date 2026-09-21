import React, { useEffect, useRef, useState } from 'react'
import type { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form'
import type { CVInput } from '@/lib/validations/cv'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Link as LinkIcon,
  Briefcase,
  Camera,
  Upload,
  Trash2,
  Sparkles,
  Loader2,
} from 'lucide-react'
import { compressImageFile } from '@/lib/image-utils'
import { createClient } from '@/lib/supabase/client'

interface PersonalInfoSectionProps {
  register: UseFormRegister<CVInput>
  errors: FieldErrors<CVInput>
  watch?: UseFormWatch<CVInput>
  setValue?: UseFormSetValue<CVInput>
}

export function PersonalInfoSection({ register, errors, watch, setValue }: PersonalInfoSectionProps) {
  const pErrors = errors.personal_info
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [accountAvatar, setAccountAvatar] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const photoUrl = watch ? watch('personal_info.photo_url') : undefined

  // Check if current user has an account avatar set in Supabase profiles
  useEffect(() => {
    let isMounted = true
    async function fetchAccountAvatar() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user && isMounted) {
          const { data } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', user.id)
            .maybeSingle()
          if (isMounted) {
            const found = data?.avatar_url || user.user_metadata?.avatar_url
            if (found) setAccountAvatar(found)
          }
        }
      } catch {
        // fail silently for offline / unauthed preview
      }
    }
    fetchAccountAvatar()
    return () => {
      isMounted = false
    }
  }, [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setErrorMessage(null)
    setIsCompressing(true)
    try {
      const compressedDataUrl = await compressImageFile(file, 320, 0.85)
      if (setValue) {
        setValue('personal_info.photo_url', compressedDataUrl, {
          shouldValidate: true,
          shouldDirty: true,
        })
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to process image')
    } finally {
      setIsCompressing(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemovePhoto = () => {
    if (setValue) {
      setValue('personal_info.photo_url', '', {
        shouldValidate: true,
        shouldDirty: true,
      })
    }
    setErrorMessage(null)
  }

  const handleUseAccountAvatar = () => {
    if (accountAvatar && setValue) {
      setValue('personal_info.photo_url', accountAvatar, {
        shouldValidate: true,
        shouldDirty: true,
      })
    }
  }

  return (
    <Card className="border-stone-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
          <User className="h-5 w-5 text-blue-600" />
          Personal Information
        </CardTitle>
        <CardDescription>
          Provide your basic contact details and links for recruiters to reach you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Photo / Avatar Picker */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Avatar Preview */}
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-sm">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
                  alt="Candidate Profile"
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

            {/* Photo Controls */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Profile Photo</h4>
                  <p className="text-xs text-slate-500">
                    JPG, PNG, or WebP. Automatically optimized for Modern CV templates and PDF export.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isCompressing}
                  className="gap-1.5 text-xs"
                >
                  <Upload className="h-3.5 w-3.5 text-blue-600" />
                  Upload Photo
                </Button>

                {accountAvatar && accountAvatar !== photoUrl && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleUseAccountAvatar}
                    className="gap-1.5 text-xs text-slate-700"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    Use Account Photo
                  </Button>
                )}

                {photoUrl && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleRemovePhoto}
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

              {errorMessage && (
                <p className="text-xs text-red-600" role="alert">
                  {errorMessage}
                </p>
              )}
              {pErrors?.photo_url && (
                <p className="text-xs text-red-600" role="alert">
                  {pErrors.photo_url.message}
                </p>
              )}

              {/* Direct URL input if toggled */}
              {showUrlInput && (
                <div className="mt-2 space-y-1">
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      placeholder="https://images.unsplash.com/photo-..."
                      className="h-9 pl-8 text-xs"
                      {...register('personal_info.photo_url')}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label htmlFor="full_name" className="text-sm font-medium text-slate-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="full_name"
                placeholder="e.g. Jane Doe"
                className="pl-9"
                {...register('personal_info.full_name')}
              />
            </div>
            {pErrors?.full_name && (
              <p className="text-xs text-red-600" role="alert">
                {pErrors.full_name.message}
              </p>
            )}
          </div>

          {/* Professional Title */}
          <div className="space-y-1.5">
            <label htmlFor="professional_title" className="text-sm font-medium text-slate-700">
              Professional Title
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="professional_title"
                placeholder="e.g. Operations Coordinator"
                className="pl-9"
                {...register('personal_info.professional_title')}
              />
            </div>
            {pErrors?.professional_title && (
              <p className="text-xs text-red-600" role="alert">
                {pErrors.professional_title.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="e.g. jane.doe@example.com"
                className="pl-9"
                {...register('personal_info.email')}
              />
            </div>
            {pErrors?.email && (
              <p className="text-xs text-red-600" role="alert">
                {pErrors.email.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-sm font-medium text-slate-700">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="phone"
                type="tel"
                placeholder="e.g. +1 555-0199"
                className="pl-9"
                {...register('personal_info.phone')}
              />
            </div>
            {pErrors?.phone && (
              <p className="text-xs text-red-600" role="alert">
                {pErrors.phone.message}
              </p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="location" className="text-sm font-medium text-slate-700">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="location"
                placeholder="e.g. Jakarta, Indonesia or San Francisco, CA"
                className="pl-9"
                {...register('personal_info.location')}
              />
            </div>
            {pErrors?.location && (
              <p className="text-xs text-red-600" role="alert">
                {pErrors.location.message}
              </p>
            )}
          </div>

          {/* LinkedIn */}
          <div className="space-y-1.5">
            <label htmlFor="linkedin" className="text-sm font-medium text-slate-700">
              LinkedIn Profile URL
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/username"
                className="pl-9"
                {...register('personal_info.linkedin')}
              />
            </div>
            {pErrors?.linkedin && (
              <p className="text-xs text-red-600" role="alert">
                {pErrors.linkedin.message}
              </p>
            )}
          </div>

          {/* GitHub */}
          <div className="space-y-1.5">
            <label htmlFor="github" className="text-sm font-medium text-slate-700">
              GitHub Profile URL <span className="text-slate-400">(Optional)</span>
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="github"
                type="url"
                placeholder="https://github.com/username"
                className="pl-9"
                {...register('personal_info.github')}
              />
            </div>
            {pErrors?.github && (
              <p className="text-xs text-red-600" role="alert">
                {pErrors.github.message}
              </p>
            )}
          </div>

          {/* Portfolio */}
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="portfolio" className="text-sm font-medium text-slate-700">
              Portfolio / Website URL
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="portfolio"
                type="url"
                placeholder="https://yourportfolio.com"
                className="pl-9"
                {...register('personal_info.portfolio')}
              />
            </div>
            {pErrors?.portfolio && (
              <p className="text-xs text-red-600" role="alert">
                {pErrors.portfolio.message}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
