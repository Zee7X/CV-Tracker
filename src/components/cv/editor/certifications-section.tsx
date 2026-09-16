import React from 'react'
import { useFieldArray, type Control, type UseFormRegister, type FieldErrors, type UseFormWatch } from 'react-hook-form'
import type { CVInput } from '@/lib/validations/cv'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Award, Plus, Trash2, Building, Calendar, Globe } from 'lucide-react'

interface CertificationsSectionProps {
  control: Control<CVInput>
  register: UseFormRegister<CVInput>
  errors: FieldErrors<CVInput>
  watch: UseFormWatch<CVInput>
}

export function CertificationsSection({ control, register, errors, watch }: CertificationsSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'certifications',
  })

  const certifications = watch('certifications') || []

  return (
    <Card className="border-stone-300">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
            <Award className="h-5 w-5 text-blue-600" />
            Certifications & Licenses
          </CardTitle>
          <CardDescription>
            List your industry certifications, credentials, and achievements.
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1 text-blue-600 hover:text-blue-700"
          onClick={() =>
            append({
              name: '',
              issuer: '',
              issue_date: '',
              credential_url: '',
              sort_order: fields.length,
            })
          }
        >
          <Plus className="h-4 w-4" />
          Add Certification
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {fields.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center">
            <Award className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm text-slate-600">No certifications added yet.</p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-3 gap-1"
              onClick={() =>
                append({
                  name: '',
                  issuer: '',
                  issue_date: '',
                  credential_url: '',
                  sort_order: 0,
                })
              }
            >
              <Plus className="h-4 w-4" />
              Add First Certification
            </Button>
          </div>
        ) : (
          fields.map((field, index) => {
            const itemErrors = errors.certifications?.[index]

            return (
              <div
                key={field.id}
                className="relative rounded-lg border border-slate-200 bg-slate-50/50 p-4 transition-all hover:border-slate-300"
              >
                <div className="mb-4 flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <span className="text-sm font-semibold text-slate-800">
                    Certification #{index + 1}
                    {certifications[index]?.name && ` — ${certifications[index].name}`}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => remove(index)}
                    aria-label={`Remove certification #${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Remove</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Name */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label
                      htmlFor={`certifications.${index}.name`}
                      className="text-sm font-medium text-slate-700"
                    >
                      Certification Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Award className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id={`certifications.${index}.name`}
                        placeholder="e.g. Project Management Fundamentals"
                        className="pl-9"
                        {...register(`certifications.${index}.name`)}
                      />
                    </div>
                    {itemErrors?.name && (
                      <p className="text-xs text-red-600" role="alert">
                        {itemErrors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Issuer */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor={`certifications.${index}.issuer`}
                      className="text-sm font-medium text-slate-700"
                    >
                      Issuing Organization
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id={`certifications.${index}.issuer`}
                        placeholder="e.g. Professional Association"
                        className="pl-9"
                        {...register(`certifications.${index}.issuer`)}
                      />
                    </div>
                    {itemErrors?.issuer && (
                      <p className="text-xs text-red-600" role="alert">{itemErrors.issuer.message}</p>
                    )}
                  </div>

                  {/* Issue Date */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor={`certifications.${index}.issue_date`}
                      className="text-sm font-medium text-slate-700"
                    >
                      Issue Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id={`certifications.${index}.issue_date`}
                        type="date"
                        className="pl-9"
                        {...register(`certifications.${index}.issue_date`)}
                      />
                    </div>
                    {itemErrors?.issue_date && (
                      <p className="text-xs text-red-600" role="alert">{itemErrors.issue_date.message}</p>
                    )}
                  </div>

                  {/* Credential URL */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label
                      htmlFor={`certifications.${index}.credential_url`}
                      className="text-sm font-medium text-slate-700"
                    >
                      Credential URL / Verification Link
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id={`certifications.${index}.credential_url`}
                        type="url"
                        placeholder="https://credly.com/badges/..."
                        className="pl-9"
                        {...register(`certifications.${index}.credential_url`)}
                      />
                    </div>
                    {itemErrors?.credential_url && (
                      <p className="text-xs text-red-600" role="alert">
                        {itemErrors.credential_url.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
