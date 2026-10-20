import React, { useEffect, useRef, useState } from 'react'
import type { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form'
import type { CVInput } from '@/lib/validations/cv'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, User } from 'lucide-react'
import { compressImageFile } from '@/lib/image-utils'
import { createClient } from '@/lib/supabase/client'
import { EditorSection, Field, FieldError } from './fields'

interface PersonalInfoSectionProps {
  register: UseFormRegister<CVInput>
  errors: FieldErrors<CVInput>
  watch?: UseFormWatch<CVInput>
  setValue?: UseFormSetValue<CVInput>
  template?: string
}

export function PersonalInfoSection({ register, errors, watch, setValue, template }: PersonalInfoSectionProps) {
  const pErrors = errors.personal_info
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [accountAvatar, setAccountAvatar] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const photoUrl = watch ? watch('personal_info.photo_url') : undefined

  // Offer the account avatar as a one-click photo if the user has one.
  useEffect(() => {
    let isMounted = true
    async function fetchAccountAvatar() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user || !isMounted) return
        const { data } = await supabase.from('profiles').select('avatar_url').eq('id', user.id).maybeSingle()
        const found = data?.avatar_url || user.user_metadata?.avatar_url
        if (isMounted && found) setAccountAvatar(found)
      } catch {
        // Offline or signed out: the upload button still works.
      }
    }
    fetchAccountAvatar()
    return () => {
      isMounted = false
    }
  }, [])

  const setPhoto = (value: string) =>
    setValue?.('personal_info.photo_url', value, { shouldValidate: true, shouldDirty: true })

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setErrorMessage(null)
    setIsCompressing(true)
    try {
      setPhoto(await compressImageFile(file, 320, 0.85))
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Could not read that image.')
    } finally {
      setIsCompressing(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <EditorSection
      title="Personal information"
      description="How recruiters reach you. Only filled fields appear on the CV."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="full_name" label="Full name" required error={pErrors?.full_name?.message}>
          <Input id="full_name" autoComplete="name" placeholder="Your Name" {...register('personal_info.full_name')} />
        </Field>

        <Field
          id="professional_title"
          label="Professional title"
          optional
          hint="The role you are applying for, not only your current one."
          error={pErrors?.professional_title?.message}
        >
          <Input
            id="professional_title"
            autoComplete="organization-title"
            placeholder="Technical Support Engineer"
            {...register('personal_info.professional_title')}
          />
        </Field>

        <Field id="email" label="Email" required error={pErrors?.email?.message}>
          <Input id="email" type="email" autoComplete="email" placeholder="email@example.com" {...register('personal_info.email')} />
        </Field>

        <Field id="phone" label="Phone" optional hint="Include the country code for international roles." error={pErrors?.phone?.message}>
          <Input id="phone" type="tel" autoComplete="tel" placeholder="+62 812 0000 0000" {...register('personal_info.phone')} />
        </Field>

        <Field id="location" label="Location" optional className="sm:col-span-2" error={pErrors?.location?.message}>
          <Input id="location" autoComplete="address-level2" placeholder="City, Country" {...register('personal_info.location')} />
        </Field>

        <Field id="linkedin" label="LinkedIn" optional error={pErrors?.linkedin?.message}>
          <Input id="linkedin" type="url" placeholder="https://linkedin.com/in/" {...register('personal_info.linkedin')} />
        </Field>

        <Field id="github" label="GitHub" optional error={pErrors?.github?.message}>
          <Input id="github" type="url" placeholder="https://github.com/" {...register('personal_info.github')} />
        </Field>

        <Field id="portfolio" label="Portfolio or website" optional className="sm:col-span-2" error={pErrors?.portfolio?.message}>
          <Input id="portfolio" type="url" placeholder="https://" {...register('personal_info.portfolio')} />
        </Field>
      </div>

      <div className="border-t border-stone-200 pt-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-stone-300 bg-stone-100">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="CV photo" className="h-full w-full object-cover" />
            ) : (
              <User className="h-8 w-8 text-stone-400" aria-hidden="true" />
            )}
            {isCompressing ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                <Loader2 className="h-5 w-5 animate-spin text-stone-700" aria-label="Processing photo" />
              </div>
            ) : null}
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <h3 className="text-sm font-medium text-stone-800">
                Photo <span className="font-normal text-stone-500">(optional)</span>
              </h3>
              <p className="text-xs text-stone-500">
                {template === 'modern'
                  ? 'Shown in the Modern template sidebar. JPG, PNG or WebP.'
                  : 'Only the Modern template shows a photo. Many international employers prefer CVs without one.'}
              </p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isCompressing}
              >
                {photoUrl ? 'Replace photo' : 'Upload photo'}
              </Button>
              {accountAvatar && accountAvatar !== photoUrl ? (
                <Button type="button" size="sm" variant="outline" onClick={() => setPhoto(accountAvatar)}>
                  Use account photo
                </Button>
              ) : null}
              {photoUrl ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setPhoto('')
                    setErrorMessage(null)
                  }}
                  className="text-red-700 hover:bg-red-50 hover:text-red-800"
                >
                  Remove
                </Button>
              ) : null}
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-xs font-medium text-blue-800 underline-offset-4 hover:underline"
                aria-expanded={showUrlInput}
              >
                {showUrlInput ? 'Hide image URL' : 'Use an image URL'}
              </button>
            </div>

            {showUrlInput ? (
              <Input
                aria-label="Photo URL"
                type="url"
                placeholder="https://"
                className="h-9"
                {...register('personal_info.photo_url')}
              />
            ) : null}
            <FieldError message={errorMessage ?? undefined} />
            <FieldError message={pErrors?.photo_url?.message} />
          </div>
        </div>
      </div>
    </EditorSection>
  )
}
