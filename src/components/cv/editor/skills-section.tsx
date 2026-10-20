import React, { useState } from 'react'
import type { FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import type { CVInput } from '@/lib/validations/cv'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { EditorSection, FieldError } from './fields'

interface SkillsSectionProps {
  watch: UseFormWatch<CVInput>
  setValue: UseFormSetValue<CVInput>
  errors: FieldErrors<CVInput>
}

export function SkillsSection({ watch, setValue, errors }: SkillsSectionProps) {
  const [skillInput, setSkillInput] = useState('')
  const skills = watch('skills') || []
  const skillError =
    (errors.skills as { root?: { message?: string }; message?: string } | undefined)?.root?.message ??
    (errors.skills as { message?: string } | undefined)?.message ??
    (Array.isArray(errors.skills)
      ? (errors.skills.find((error) => error?.message) as { message?: string } | undefined)?.message
      : undefined)

  const addSkills = (raw: string) => {
    // Accept a pasted list: "Laravel, MySQL; Docker" adds three skills.
    const candidates = raw
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (candidates.length === 0) return
    const updated = [...skills]
    for (const item of candidates) {
      if (!updated.some((s) => s.toLowerCase() === item.toLowerCase())) updated.push(item)
    }
    setValue('skills', updated, { shouldDirty: true, shouldValidate: true })
    setSkillInput('')
  }

  const removeSkill = (index: number) =>
    setValue(
      'skills',
      skills.filter((_, idx) => idx !== index),
      { shouldDirty: true, shouldValidate: true }
    )

  return (
    <EditorSection
      title="Skills"
      description="List the tools, languages and methods a recruiter would search for. Soft skills read better as results in your experience bullets."
    >
      <div className="space-y-1.5">
        <label htmlFor="skill-input" className="block text-sm font-medium text-stone-800">
          Add skills
        </label>
        <div className="flex gap-2">
          <Input
            id="skill-input"
            value={skillInput}
            onChange={(event) => setSkillInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                addSkills(skillInput)
              }
            }}
            placeholder="Laravel, MySQL, Docker"
            className="flex-1"
          />
          <Button type="button" variant="outline" onClick={() => addSkills(skillInput)} disabled={!skillInput.trim()}>
            Add
          </Button>
        </div>
        <p className="text-xs text-stone-500">Press Enter to add. Separate several with commas.</p>
      </div>

      {skills.length > 0 ? (
        <ul className="flex flex-wrap gap-2" aria-label="Added skills">
          {skills.map((skill, index) => (
            <li
              key={`${skill}-${index}`}
              className="inline-flex items-center gap-1 rounded-md border border-stone-900/10 bg-white/50 py-1 pl-2.5 pr-1 text-sm text-stone-900"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(index)}
                className="flex h-6 w-6 items-center justify-center rounded text-stone-500 hover:bg-stone-200 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-800"
                aria-label={`Remove ${skill}`}
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-stone-500">No skills added yet.</p>
      )}
      <FieldError message={skillError} />
    </EditorSection>
  )
}
