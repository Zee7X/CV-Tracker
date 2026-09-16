import React from 'react'
import { useFieldArray, type Control, type UseFormRegister, type FieldErrors, type UseFormWatch } from 'react-hook-form'
import type { CVInput } from '@/lib/validations/cv'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { GraduationCap, Plus, Trash2, Building, Calendar, BookOpen } from 'lucide-react'

interface EducationSectionProps {
  control: Control<CVInput>
  register: UseFormRegister<CVInput>
  errors: FieldErrors<CVInput>
  watch: UseFormWatch<CVInput>
}

export function EducationSection({ control, register, errors, watch }: EducationSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'educations',
  })

  const educations = watch('educations') || []

  return (
    <Card className="border-stone-300">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            Education
          </CardTitle>
          <CardDescription>
            Add your degrees, academic qualifications, and institutions.
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1 text-blue-600 hover:text-blue-700"
          onClick={() =>
            append({
              institution: '',
              degree: '',
              field_of_study: '',
              start_date: '',
              end_date: '',
              description: '',
              sort_order: fields.length,
            })
          }
        >
          <Plus className="h-4 w-4" />
          Add Education
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {fields.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center">
            <GraduationCap className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm text-slate-600">No education entries added yet.</p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-3 gap-1"
              onClick={() =>
                append({
                  institution: '',
                  degree: '',
                  field_of_study: '',
                  start_date: '',
                  end_date: '',
                  description: '',
                  sort_order: 0,
                })
              }
            >
              <Plus className="h-4 w-4" />
              Add First Education
            </Button>
          </div>
        ) : (
          fields.map((field, index) => {
            const itemErrors = errors.educations?.[index]

            return (
              <div
                key={field.id}
                className="relative rounded-lg border border-slate-200 bg-slate-50/50 p-4 transition-all hover:border-slate-300"
              >
                <div className="mb-4 flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <span className="text-sm font-semibold text-slate-800">
                    Education #{index + 1}
                    {educations[index]?.institution && ` — ${educations[index].institution}`}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => remove(index)}
                    aria-label={`Remove education #${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Remove</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Institution */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label
                      htmlFor={`educations.${index}.institution`}
                      className="text-sm font-medium text-slate-700"
                    >
                      Institution / University <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id={`educations.${index}.institution`}
                        placeholder="e.g. University of California, Berkeley"
                        className="pl-9"
                        {...register(`educations.${index}.institution`)}
                      />
                    </div>
                    {itemErrors?.institution && (
                      <p className="text-xs text-red-600" role="alert">
                        {itemErrors.institution.message}
                      </p>
                    )}
                  </div>

                  {/* Degree */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor={`educations.${index}.degree`}
                      className="text-sm font-medium text-slate-700"
                    >
                      Degree / Certification Level
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id={`educations.${index}.degree`}
                        placeholder="e.g. Bachelor of Science"
                        className="pl-9"
                        {...register(`educations.${index}.degree`)}
                      />
                    </div>
                    {itemErrors?.degree && (
                      <p className="text-xs text-red-600" role="alert">{itemErrors.degree.message}</p>
                    )}
                  </div>

                  {/* Field of Study */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor={`educations.${index}.field_of_study`}
                      className="text-sm font-medium text-slate-700"
                    >
                      Field of Study / Major
                    </label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id={`educations.${index}.field_of_study`}
                        placeholder="e.g. Computer Science"
                        className="pl-9"
                        {...register(`educations.${index}.field_of_study`)}
                      />
                    </div>
                    {itemErrors?.field_of_study && (
                      <p className="text-xs text-red-600" role="alert">{itemErrors.field_of_study.message}</p>
                    )}
                  </div>

                  {/* Start Date */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor={`educations.${index}.start_date`}
                      className="text-sm font-medium text-slate-700"
                    >
                      Start Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id={`educations.${index}.start_date`}
                        type="date"
                        className="pl-9"
                        {...register(`educations.${index}.start_date`)}
                      />
                    </div>
                    {itemErrors?.start_date && (
                      <p className="text-xs text-red-600" role="alert">{itemErrors.start_date.message}</p>
                    )}
                  </div>

                  {/* End Date */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor={`educations.${index}.end_date`}
                      className="text-sm font-medium text-slate-700"
                    >
                      End Date (or Expected)
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id={`educations.${index}.end_date`}
                        type="date"
                        className="pl-9"
                        {...register(`educations.${index}.end_date`)}
                      />
                    </div>
                    {itemErrors?.end_date && (
                      <p className="text-xs text-red-600" role="alert">{itemErrors.end_date.message}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label
                      htmlFor={`educations.${index}.description`}
                      className="text-sm font-medium text-slate-700"
                    >
                      Description / Honors / GPA
                    </label>
                    <textarea
                      id={`educations.${index}.description`}
                      rows={2}
                      className="w-full rounded-md border border-slate-300 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      placeholder="e.g. GPA 3.9/4.0, Dean's Honors List, Relevant Coursework: Algorithms, Database Design"
                      {...register(`educations.${index}.description`)}
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
