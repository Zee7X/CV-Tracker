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
import { EditorSection, EntryCard, Field } from './fields'

interface SectionProps {
  control: Control<CVInput>
  register: UseFormRegister<CVInput>
  errors: FieldErrors<CVInput>
  watch: UseFormWatch<CVInput>
  setValue?: UseFormSetValue<CVInput>
}

const EMPTY_CERTIFICATION = { name: '', issuer: '', issue_date: '', credential_url: '', sort_order: 0 }

export function CertificationsSection({ control, register, errors, watch }: SectionProps) {
  const { fields, append, remove, move } = useFieldArray({ control, name: 'certifications' })
  const certifications = watch('certifications') || []

  const addButton = (
    <Button type="button" variant="outline" size="sm" onClick={() => append(EMPTY_CERTIFICATION)}>
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add certification
    </Button>
  )

  return (
    <EditorSection
      title="Certifications"
      description="Licences and courses with a certificate. Add a credential link so recruiters can verify it."
      action={fields.length > 0 ? addButton : undefined}
    >
      {fields.length === 0 ? (
        <div className="rounded-md border border-dashed border-stone-300 px-4 py-8 text-center">
          <p className="text-sm text-stone-700">No certifications yet.</p>
          <p className="mt-1 text-xs text-stone-500">Optional. Skip this section if you have none.</p>
          <div className="mt-4">{addButton}</div>
        </div>
      ) : (
        fields.map((field, index) => {
          const itemErrors = errors.certifications?.[index]
          const heading = certifications[index]?.name || 'New certification'
          const id = (name: string) => `certifications.${index}.${name}`

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
                <Field id={id('name')} label="Certification" required error={itemErrors?.name?.message}>
                  <Input id={id('name')} placeholder="Certification name" {...register(`certifications.${index}.name`)} />
                </Field>

                <Field id={id('issuer')} label="Issued by" optional error={itemErrors?.issuer?.message}>
                  <Input id={id('issuer')} placeholder="Organisation" {...register(`certifications.${index}.issuer`)} />
                </Field>

                <Field id={id('issue_date')} label="Issue month" optional error={itemErrors?.issue_date?.message}>
                  <Input id={id('issue_date')} type="month" placeholder="YYYY-MM" {...register(`certifications.${index}.issue_date`)} />
                </Field>

                <Field id={id('credential_url')} label="Credential link" optional error={itemErrors?.credential_url?.message}>
                  <Input id={id('credential_url')} type="url" placeholder="https://" {...register(`certifications.${index}.credential_url`)} />
                </Field>
              </div>
            </EntryCard>
          )
        })
      )}
    </EditorSection>
  )
}
