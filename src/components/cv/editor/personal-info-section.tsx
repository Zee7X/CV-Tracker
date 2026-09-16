import React from 'react'
import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import type { CVInput } from '@/lib/validations/cv'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { User, Mail, Phone, MapPin, Globe, Link as LinkIcon, Briefcase } from 'lucide-react'

interface PersonalInfoSectionProps {
  register: UseFormRegister<CVInput>
  errors: FieldErrors<CVInput>
}

export function PersonalInfoSection({ register, errors }: PersonalInfoSectionProps) {
  const pErrors = errors.personal_info

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
      <CardContent className="space-y-4">
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
