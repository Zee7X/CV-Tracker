import React from 'react'
import { useFieldArray, type Control, type UseFormRegister, type FieldErrors, type UseFormWatch } from 'react-hook-form'
import type { CVInput } from '@/lib/validations/cv'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Briefcase, Plus, Trash2, Building, Calendar, MapPin } from 'lucide-react'

interface ExperienceSectionProps {
  control: Control<CVInput>
  register: UseFormRegister<CVInput>
  errors: FieldErrors<CVInput>
  watch: UseFormWatch<CVInput>
}

export function ExperienceSection({ control, register, errors, watch }: ExperienceSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'experiences',
  })

  const experiences = watch('experiences') || []

  return (
    <Card className="border-stone-300">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
            <Briefcase className="h-5 w-5 text-blue-600" />
            Work Experience
          </CardTitle>
          <CardDescription>
            Detail your relevant work history, responsibilities, and achievements.
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1 text-blue-600 hover:text-blue-700"
          onClick={() =>
            append({
              company: '',
              position: '',
              location: '',
              start_date: '',
              end_date: '',
              is_current: false,
              description: '',
              sort_order: fields.length,
            })
          }
        >
          <Plus className="h-4 w-4" />
          Add Experience
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {fields.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center">
            <Briefcase className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm text-slate-600">No work experience added yet.</p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-3 gap-1"
              onClick={() =>
                append({
                  company: '',
                  position: '',
                  location: '',
                  start_date: '',
                  end_date: '',
                  is_current: false,
                  description: '',
                  sort_order: 0,
                })
              }
            >
              <Plus className="h-4 w-4" />
              Add First Experience
            </Button>
          </div>
        ) : (
          fields.map((field, index) => {
            const isCurrent = experiences[index]?.is_current
            const itemErrors = errors.experiences?.[index]

            return (
              <div
                key={field.id}
                className="relative rounded-lg border border-slate-200 bg-slate-50/50 p-4 transition-all hover:border-slate-300"
              >
                <div className="mb-4 flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <span className="text-sm font-semibold text-slate-800">
                    Experience #{index + 1}
                    {experiences[index]?.company && ` — ${experiences[index].company}`}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => remove(index)}
                    aria-label={`Remove experience #${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Remove</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Position */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor={`experiences.${index}.position`}
                      className="text-sm font-medium text-slate-700"
                    >
                      Job Title / Position <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id={`experiences.${index}.position`}
                        placeholder="e.g. Operations Coordinator"
                        className="pl-9"
                        {...register(`experiences.${index}.position`)}
                      />
                    </div>
                    {itemErrors?.position && (
                      <p className="text-xs text-red-600" role="alert">
                        {itemErrors.position.message}
                      </p>
                    )}
                  </div>

                  {/* Company */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor={`experiences.${index}.company`}
                      className="text-sm font-medium text-slate-700"
                    >
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id={`experiences.${index}.company`}
                        placeholder="e.g. Acme Corp"
                        className="pl-9"
                        {...register(`experiences.${index}.company`)}
                      />
                    </div>
                    {itemErrors?.company && (
                      <p className="text-xs text-red-600" role="alert">
                        {itemErrors.company.message}
                      </p>
                    )}
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label
                      htmlFor={`experiences.${index}.location`}
                      className="text-sm font-medium text-slate-700"
                    >
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id={`experiences.${index}.location`}
                        placeholder="e.g. New York, NY (Remote)"
                        className="pl-9"
                        {...register(`experiences.${index}.location`)}
                      />
                    </div>
                    {itemErrors?.location && (
                      <p className="text-xs text-red-600" role="alert">{itemErrors.location.message}</p>
                    )}
                  </div>

                  {/* Start Date */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor={`experiences.${index}.start_date`}
                      className="text-sm font-medium text-slate-700"
                    >
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id={`experiences.${index}.start_date`}
                        type="date"
                        className="pl-9"
                        {...register(`experiences.${index}.start_date`)}
                      />
                    </div>
                    {itemErrors?.start_date && (
                      <p className="text-xs text-red-600" role="alert">
                        {itemErrors.start_date.message}
                      </p>
                    )}
                  </div>

                  {/* End Date / Present */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor={`experiences.${index}.end_date`}
                        className="text-sm font-medium text-slate-700"
                      >
                        End Date
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          {...register(`experiences.${index}.is_current`)}
                        />
                        <span>Currently working here</span>
                      </label>
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id={`experiences.${index}.end_date`}
                        type="date"
                        disabled={isCurrent}
                        className="pl-9 disabled:bg-slate-100 disabled:text-slate-400"
                        {...register(`experiences.${index}.end_date`)}
                      />
                    </div>
                    {itemErrors?.end_date && (
                      <p className="text-xs text-red-600" role="alert">{itemErrors.end_date.message}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label
                      htmlFor={`experiences.${index}.description`}
                      className="text-sm font-medium text-slate-700"
                    >
                      Description / Key Responsibilities
                    </label>
                    <textarea
                      id={`experiences.${index}.description`}
                      rows={3}
                      className="w-full rounded-md border border-slate-300 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      placeholder="• Coordinated a team of 5 across daily operations.&#10;• Reduced processing time by 40% through a simpler workflow."
                      {...register(`experiences.${index}.description`)}
                    />
                    {itemErrors?.description && (
                      <p className="text-xs text-red-600" role="alert">{itemErrors.description.message}</p>
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
