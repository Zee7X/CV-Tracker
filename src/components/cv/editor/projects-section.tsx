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
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { EditorSection, EntryCard, Field, Textarea } from './fields'

interface SectionProps {
  control: Control<CVInput>
  register: UseFormRegister<CVInput>
  errors: FieldErrors<CVInput>
  watch: UseFormWatch<CVInput>
  setValue?: UseFormSetValue<CVInput>
}

const EMPTY_PROJECT = { name: '', description: '', project_url: '', start_date: '', end_date: '', sort_order: 0 }

export function ProjectsSection({ control, register, errors, watch }: SectionProps) {
  const { fields, append, remove, move } = useFieldArray({ control, name: 'projects' })
  const projects = watch('projects') || []

  const addButton = (
    <Button type="button" variant="outline" size="sm" onClick={() => append(EMPTY_PROJECT)}>
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add project
    </Button>
  )

  return (
    <EditorSection
      title="Projects"
      description="Projects appear in the order you set here. Put the one most relevant to the job first."
      action={fields.length > 0 ? addButton : undefined}
    >
      {fields.length === 0 ? (
        <div className="rounded-md border border-dashed border-stone-300 px-4 py-8 text-center">
          <p className="text-sm text-stone-700">No projects yet.</p>
          <p className="mt-1 text-xs text-stone-500">Optional. Add work that shows a skill your job history doesn&apos;t.</p>
          <div className="mt-4">{addButton}</div>
        </div>
      ) : (
        fields.map((field, index) => {
          const itemErrors = errors.projects?.[index]
          const heading = projects[index]?.name || 'New project'
          const id = (name: string) => `projects.${index}.${name}`

          return (
            <EntryCard
              key={field.id}
              heading={heading}
              actions={
                <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                  aria-label={`Move ${heading} up`}
                  title="Move up"
                >
                  <ArrowUp className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={index === fields.length - 1}
                  onClick={() => move(index, index + 1)}
                  aria-label={`Move ${heading} down`}
                  title="Move down"
                >
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </Button>
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
                </>
              }
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field id={id('name')} label="Project name" required error={itemErrors?.name?.message}>
                  <Input id={id('name')} placeholder="Project name" {...register(`projects.${index}.name`)} />
                </Field>

                <Field id={id('project_url')} label="Link" optional error={itemErrors?.project_url?.message}>
                  <Input id={id('project_url')} type="url" placeholder="https://" {...register(`projects.${index}.project_url`)} />
                </Field>

                <Field id={id('start_date')} label="Start month" optional error={itemErrors?.start_date?.message}>
                  <Input id={id('start_date')} type="month" placeholder="YYYY-MM" {...register(`projects.${index}.start_date`)} />
                </Field>

                <Field id={id('end_date')} label="End month" optional error={itemErrors?.end_date?.message}>
                  <Input id={id('end_date')} type="month" placeholder="YYYY-MM" {...register(`projects.${index}.end_date`)} />
                </Field>

                <Field
                  id={id('description')}
                  label="Description"
                  optional
                  hint='Name the stack and the problem you solved. Start lines with "-" for bullet points.'
                  className="sm:col-span-2"
                  error={itemErrors?.description?.message}
                >
                  <Textarea id={id('description')} rows={4} {...register(`projects.${index}.description`)} />
                </Field>
              </div>
            </EntryCard>
          )
        })
      )}
    </EditorSection>
  )
}
