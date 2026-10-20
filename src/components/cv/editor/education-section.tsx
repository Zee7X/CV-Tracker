import React from 'react'
import {
  useFieldArray,
  type Control,
  type UseFormRegister,
  type FieldErrors,
  type UseFormWatch,
  type UseFormSetValue,
} from 'react-hook-form'
import type { CVInput } from '@/lib/validations/cv'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import { EditorSection, EntryCard, Field, Textarea } from './fields'

interface SectionProps {
  control: Control<CVInput>
  register: UseFormRegister<CVInput>
  errors: FieldErrors<CVInput>
  watch: UseFormWatch<CVInput>
  setValue?: UseFormSetValue<CVInput>
}

const EMPTY_EDUCATION = {
  institution: '',
  degree: '',
  field_of_study: '',
  start_date: '',
  end_date: '',
  description: '',
  sort_order: 0,
}

export function EducationSection({ control, register, errors, watch }: SectionProps) {
  const { fields, prepend, remove } = useFieldArray({ control, name: 'educations' })
  const educations = watch('educations') || []

  const addButton = (
    <Button type="button" variant="outline" size="sm" onClick={() => prepend(EMPTY_EDUCATION)}>
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add education
    </Button>
  )

  return (
    <EditorSection
      title="Education"
      description="Sorted by end month on the CV, most recent first."
      action={fields.length > 0 ? addButton : undefined}
    >
      {fields.length === 0 ? (
        <div className="rounded-md border border-dashed border-stone-300 px-4 py-8 text-center">
          <p className="text-sm text-stone-700">No education added yet.</p>
          <p className="mt-1 text-xs text-stone-500">Add your highest or most recent qualification.</p>
          <div className="mt-4">{addButton}</div>
        </div>
      ) : (
        fields.map((field, index) => {
          const current = educations[index]
          const itemErrors = errors.educations?.[index]
          const heading = current?.institution || 'New education'
          const id = (name: string) => `educations.${index}.${name}`

          return (
            <EntryCard
              key={field.id}
              heading={heading}
              actions={
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-red-700 hover:bg-red-50 hover:text-red-800"
                  onClick={() => remove(index)}
                  aria-label={`Remove ${heading}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Remove</span>
                </Button>
              }
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field id={id('institution')} label="School or university" required className="sm:col-span-2" error={itemErrors?.institution?.message}>
                  <Input id={id('institution')} placeholder="Institution name" {...register(`educations.${index}.institution`)} />
                </Field>

                <Field id={id('degree')} label="Degree" optional error={itemErrors?.degree?.message}>
                  <Input id={id('degree')} placeholder="Bachelor of Computer Science" {...register(`educations.${index}.degree`)} />
                </Field>

                <Field id={id('field_of_study')} label="Field of study" optional error={itemErrors?.field_of_study?.message}>
                  <Input id={id('field_of_study')} placeholder="Informatics" {...register(`educations.${index}.field_of_study`)} />
                </Field>

                <Field id={id('start_date')} label="Start month" optional error={itemErrors?.start_date?.message}>
                  <Input id={id('start_date')} type="month" placeholder="YYYY-MM" {...register(`educations.${index}.start_date`)} />
                </Field>

                <Field id={id('end_date')} label="End month" optional hint="Use the expected month if you haven't graduated." error={itemErrors?.end_date?.message}>
                  <Input id={id('end_date')} type="month" placeholder="YYYY-MM" {...register(`educations.${index}.end_date`)} />
                </Field>

                <Field id={id('description')} label="Details" optional hint="GPA, honours or relevant coursework. Leave empty if it adds nothing." className="sm:col-span-2" error={itemErrors?.description?.message}>
                  <Textarea id={id('description')} rows={2} {...register(`educations.${index}.description`)} />
                </Field>
              </div>
            </EntryCard>
          )
        })
      )}
    </EditorSection>
  )
}
