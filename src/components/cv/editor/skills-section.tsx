import React, { useState } from 'react'
import type { FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import type { CVInput } from '@/lib/validations/cv'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Wrench, Plus, X } from 'lucide-react'

interface SkillsSectionProps {
  watch: UseFormWatch<CVInput>
  setValue: UseFormSetValue<CVInput>
  errors: FieldErrors<CVInput>
}

const COMMON_SKILLS = [
  'Communication',
  'Teamwork',
  'Problem Solving',
  'Project Management',
  'Customer Service',
  'Leadership',
  'Microsoft Excel',
  'Data Analysis',
  'Administration',
  'Sales',
  'Marketing',
  'Research',
  'Presentation',
  'Time Management',
  'English',
]

export function SkillsSection({ watch, setValue, errors }: SkillsSectionProps) {
  const [skillInput, setSkillInput] = useState('')
  const skills = watch('skills') || []
  const skillError =
    (errors.skills as { root?: { message?: string }; message?: string } | undefined)?.root?.message ??
    (errors.skills as { message?: string } | undefined)?.message ??
    (Array.isArray(errors.skills)
      ? (errors.skills.find((error) => error?.message) as { message?: string } | undefined)?.message
      : undefined)

  const handleAddSkill = (skillToAdd: string) => {
    if (!skillToAdd) return
    // Split by comma, semicolon or newline to support multiple skills entered together
    const candidates = skillToAdd
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean)

    if (candidates.length === 0) return

    const updated = [...skills]
    for (const item of candidates) {
      const isDuplicate = updated.some((s) => s.toLowerCase() === item.toLowerCase())
      if (!isDuplicate) {
        updated.push(item)
      }
    }

    setValue('skills', updated, { shouldDirty: true, shouldValidate: true })
    setSkillInput('')
  }

  const handleRemoveSkill = (indexToRemove: number) => {
    setValue(
      'skills',
      skills.filter((_, idx) => idx !== indexToRemove),
      { shouldDirty: true, shouldValidate: true }
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSkill(skillInput)
    }
  }

  return (
    <Card className="border-stone-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
          <Wrench className="h-5 w-5 text-blue-600" />
          Skills
        </CardTitle>
        <CardDescription>
          Add keywords and competencies that match your job search. Press Enter or click Add.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input bar */}
        <div className="flex gap-2">
          <Input
            id="skill-input"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a skill (e.g. Communication, Microsoft Excel) and press Enter"
            className="flex-1"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleAddSkill(skillInput)}
            disabled={!skillInput.trim()}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>

        {/* Selected skills */}
        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-2">
            {skills.map((skill, index) => (
              <span
                key={`${skill}-${index}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 transition-colors"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(index)}
                  className="rounded-full p-0.5 text-blue-500 hover:bg-blue-200 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  aria-label={`Remove skill ${skill}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No skills added yet.</p>
        )}
        {skillError ? <p className="text-xs text-red-600" role="alert">{skillError}</p> : null}

        {/* Suggestions */}
        <div className="pt-2 border-t border-slate-100">
          <p className="mb-2 text-xs font-medium text-slate-500">Popular Suggestions:</p>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_SKILLS.filter((s) => !skills.some((existing) => existing.toLowerCase() === s.toLowerCase())).map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleAddSkill(suggestion)}
                className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
