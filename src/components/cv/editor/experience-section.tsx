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
import { EditorSection, EntryCard, Field, FieldError, Textarea } from './fields'

interface SectionProps {
  control: Control<CVInput>
  register: UseFormRegister<CVInput>
  errors: FieldErrors<CVInput>
  watch: UseFormWatch<CVInput>
  setValue: UseFormSetValue<CVInput>
}

const EMPTY_EXPERIENCE = {
  company: '',
  position: '',
  location: '',
  start_date: '',
  end_date: '',
  is_current: false,
  description: '',
  sort_order: 0,
}

export function ExperienceSection({ control, register, errors, watch, setValue }: SectionProps) {
  // New roles are usually the most recent, so they are added on top, matching the CV order.
  const { fields, prepend, remove } = useFieldArray({ control, name: 'experiences' })
  const experiences = watch('experiences') || []

  const addButton = (
    <Button type="button" variant="outline" size="sm" onClick={() => prepend(EMPTY_EXPERIENCE)}>
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add experience
    </Button>
  )

  return (
    <EditorSection
      title="Work experience"
      description="The CV lists current roles first, then the rest by start month, newest first. You don't need to reorder anything."
      action={fields.length > 0 ? addButton : undefined}
    >
      {fields.length === 0 ? (
        <div className="rounded-md border border-dashed border-stone-900/10 px-4 py-8 text-center">
          <p className="text-sm text-stone-700">No work experience yet.</p>
          <p className="mt-1 text-xs text-stone-500">Add your current or most recent job first.</p>
          <div className="mt-4">{addButton}</div>
        </div>
      ) : (
        fields.map((field, index) => {
          const current = experiences[index]
          const isCurrent = Boolean(current?.is_current)
          const itemErrors = errors.experiences?.[index]
          const heading = [current?.position, current?.company].filter(Boolean).join(', ') || 'New experience'
          const id = (name: string) => `experiences.${index}.${name}`

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
                <Field id={id('position')} label="Job title" required error={itemErrors?.position?.message}>
                  <Input id={id('position')} placeholder="Job title" {...register(`experiences.${index}.position`)} />
                </Field>

                <Field id={id('company')} label="Company" required error={itemErrors?.company?.message}>
                  <Input id={id('company')} placeholder="Company name" {...register(`experiences.${index}.company`)} />
                </Field>

                <Field id={id('location')} label="Location" optional className="sm:col-span-2" error={itemErrors?.location?.message}>
                  <Input id={id('location')} placeholder="City, Country" {...register(`experiences.${index}.location`)} />
                </Field>

                <Field id={id('start_date')} label="Start month" required error={itemErrors?.start_date?.message}>
                  <Input id={id('start_date')} type="month" placeholder="YYYY-MM" {...register(`experiences.${index}.start_date`)} />
                </Field>

                <div className="space-y-1.5">
                  <label htmlFor={id('end_date')} className="block text-sm font-medium text-stone-800">
                    End month
                  </label>
                  {isCurrent ? (
                    <Input id={id('end_date')} type="text" disabled value="Present" className="bg-stone-900/[0.05] text-stone-600" />
                  ) : (
                    <Input id={id('end_date')} type="month" placeholder="YYYY-MM" {...register(`experiences.${index}.end_date`)} />
                  )}
                  <label className="flex w-fit cursor-pointer items-center gap-2 pt-1 text-sm text-stone-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-stone-400 accent-brand-800"
                      {...register(`experiences.${index}.is_current`, {
                        onChange: (event) => {
                          if (event.target.checked) {
                            setValue(`experiences.${index}.end_date`, '', { shouldDirty: true, shouldValidate: true })
                          }
                        },
                      })}
                    />
                    I currently work here
                  </label>
                  {!isCurrent ? <FieldError message={itemErrors?.end_date?.message} /> : null}
                </div>

                <Field
                  id={id('description')}
                  label="What you did"
                  optional
                  hint='Start each line with "-" to make it a bullet point. Begin with a verb and add results where you have them.'
                  className="sm:col-span-2"
                  error={itemErrors?.description?.message}
                >
                  <Textarea
                    id={id('description')}
                    rows={5}
                    placeholder={'- Built ...\n- Reduced ... by ...'}
                    {...register(`experiences.${index}.description`)}
                  />
                </Field>
              </div>
            </EntryCard>
          )
        })
      )}
    </EditorSection>
  )
}
