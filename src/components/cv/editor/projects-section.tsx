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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FolderOpen, Plus, Trash2, Globe, Calendar, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'

interface ProjectsSectionProps {
  control: Control<CVInput>
  register: UseFormRegister<CVInput>
  errors: FieldErrors<CVInput>
  watch: UseFormWatch<CVInput>
  setValue: UseFormSetValue<CVInput>
}

export function ProjectsSection({ control, register, errors, watch, setValue }: ProjectsSectionProps) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'projects',
  })

  const projects = watch('projects') || []

  const handleSortNewest = () => {
    const currentProjects = watch('projects') || []
    if (currentProjects.length <= 1) return
    const sorted = [...currentProjects].sort((a, b) => {
      const dateA = a.end_date || a.start_date || ''
      const dateB = b.end_date || b.start_date || ''
      return dateB.localeCompare(dateA)
    })
    setValue('projects', sorted, { shouldDirty: true, shouldValidate: true })
  }

  return (
    <Card className="border-stone-300">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
            <FolderOpen className="h-5 w-5 text-blue-600" />
            Key Projects
          </CardTitle>
          <CardDescription>
            Showcase work, academic, volunteer, or personal projects that demonstrate your abilities.
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {fields.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 text-slate-700 hover:text-blue-600"
              onClick={handleSortNewest}
              title="Sort projects newest first"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              Sort Newest First
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1 text-blue-600 hover:text-blue-700"
            onClick={() =>
              append({
                name: '',
                description: '',
                project_url: '',
                start_date: '',
                end_date: '',
                sort_order: fields.length,
              })
            }
          >
            <Plus className="h-4 w-4" />
            Add Project
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {fields.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center">
            <FolderOpen className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm text-slate-600">No projects added yet.</p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-3 gap-1"
              onClick={() =>
                append({
                  name: '',
                  description: '',
                  project_url: '',
                  start_date: '',
                  end_date: '',
                  sort_order: 0,
                })
              }
            >
              <Plus className="h-4 w-4" />
              Add First Project
            </Button>
          </div>
        ) : (
          fields.map((field, index) => {
            const itemErrors = errors.projects?.[index]

            return (
              <div
                key={field.id}
                className="relative rounded-lg border border-slate-200 bg-slate-50/50 p-4 transition-all hover:border-slate-300"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                  <span className="text-sm font-semibold text-slate-800">
                    Project #{index + 1}
                    {projects[index]?.name && ` — ${projects[index].name}`}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={index === 0}
                      className="h-8 px-2 text-slate-600 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-30"
                      onClick={() => move(index, index - 1)}
                      title="Move Up"
                      aria-label={`Move project #${index + 1} up`}
                    >
                      <ArrowUp className="h-4 w-4" />
                      <span className="hidden sm:inline text-xs">Move Up</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={index === fields.length - 1}
                      className="h-8 px-2 text-slate-600 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-30"
                      onClick={() => move(index, index + 1)}
                      title="Move Down"
                      aria-label={`Move project #${index + 1} down`}
                    >
                      <ArrowDown className="h-4 w-4" />
                      <span className="hidden sm:inline text-xs">Move Down</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => remove(index)}
                      aria-label={`Remove project #${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline text-xs">Remove</span>
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Project Name */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label
                      htmlFor={`projects.${index}.name`}
                      className="text-sm font-medium text-slate-700"
                    >
                      Project Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FolderOpen className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id={`projects.${index}.name`}
                        placeholder="e.g. Branch Service Improvement"
                        className="pl-9"
                        {...register(`projects.${index}.name`)}
                      />
                    </div>
                    {itemErrors?.name && (
                      <p className="text-xs text-red-600" role="alert">
                        {itemErrors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Project URL */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label
                      htmlFor={`projects.${index}.project_url`}
                      className="text-sm font-medium text-slate-700"
                    >
                      Project / Portfolio URL
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id={`projects.${index}.project_url`}
                        type="url"
                        placeholder="https://portfolio.example.com/project"
                        className="pl-9"
                        {...register(`projects.${index}.project_url`)}
                      />
                    </div>
                    {itemErrors?.project_url && (
                      <p className="text-xs text-red-600" role="alert">
                        {itemErrors.project_url.message}
                      </p>
                    )}
                  </div>

                  {/* Start Date */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor={`projects.${index}.start_date`}
                      className="text-sm font-medium text-slate-700"
                    >
                      Start Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id={`projects.${index}.start_date`}
                        type="date"
                        className="pl-9"
                        {...register(`projects.${index}.start_date`)}
                      />
                    </div>
                    {itemErrors?.start_date && (
                      <p className="text-xs text-red-600" role="alert">{itemErrors.start_date.message}</p>
                    )}
                  </div>

                  {/* End Date */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor={`projects.${index}.end_date`}
                      className="text-sm font-medium text-slate-700"
                    >
                      End Date / Ongoing
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id={`projects.${index}.end_date`}
                        type="date"
                        className="pl-9"
                        {...register(`projects.${index}.end_date`)}
                      />
                    </div>
                    {itemErrors?.end_date && (
                      <p className="text-xs text-red-600" role="alert">{itemErrors.end_date.message}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label
                      htmlFor={`projects.${index}.description`}
                      className="text-sm font-medium text-slate-700"
                    >
                      Description & Results
                    </label>
                    <textarea
                      id={`projects.${index}.description`}
                      rows={3}
                      className="w-full rounded-md border border-slate-300 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      placeholder="e.g. Coordinated a three-month service improvement project that reduced customer wait times by 25%."
                      {...register(`projects.${index}.description`)}
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
