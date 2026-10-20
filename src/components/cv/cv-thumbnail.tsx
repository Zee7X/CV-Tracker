import type { CV } from '@/types/cv'
import { cn } from '@/lib/utils'

/*
 * A small A4 sheet that hints at the CV's template: the real name sits on the
 * page, the body lines are drawn. Used where a full render would be too heavy
 * (lists of CVs), so the user can still tell versions apart at a glance.
 */
export function CVThumbnail({ cv, className }: { cv: Pick<CV, 'template' | 'personal_info' | 'name'>; className?: string }) {
  const name = cv.personal_info?.full_name || cv.name
  const line = 'block h-[3%] rounded-full bg-stone-200'

  return (
    <span
      aria-hidden="true"
      className={cn('relative block aspect-[210/297] shrink-0 overflow-hidden rounded-[3px] bg-white shadow-[0_1px_3px_rgba(28,25,23,0.18)] ring-1 ring-stone-200', className)}
    >
      {cv.template === 'modern' ? (
        <span className="absolute inset-0 flex">
          <span className="flex w-[34%] flex-col gap-[6%] bg-slate-800 px-[7%] pt-[12%]">
            <span className="block aspect-square w-[60%] rounded-full bg-slate-600" />
            <span className="block h-[2.5%] w-[80%] rounded-full bg-slate-600" />
            <span className="block h-[2.5%] w-[60%] rounded-full bg-slate-600" />
            <span className="block h-[2.5%] w-[70%] rounded-full bg-slate-600" />
          </span>
          <span className="flex flex-1 flex-col gap-[4%] px-[8%] pt-[12%]">
            <span className="block h-[5%] w-[85%] rounded-full bg-stone-800" />
            <span className={cn(line, 'w-[60%] bg-blue-200')} />
            <span className={cn(line, 'mt-[6%] w-full')} />
            <span className={cn(line, 'w-[90%]')} />
            <span className={cn(line, 'w-[75%]')} />
            <span className={cn(line, 'mt-[6%] w-full')} />
            <span className={cn(line, 'w-[80%]')} />
          </span>
        </span>
      ) : cv.template === 'professional' ? (
        <span className="absolute inset-0 flex flex-col gap-[3.5%] px-[9%] pt-[10%]">
          <span className="block h-[5%] w-[70%] rounded-full bg-[#1e3a5f]" />
          <span className={cn(line, 'w-[45%]')} />
          <span className="mt-[3%] block h-px w-full bg-[#1e3a5f]" />
          {[0, 1, 2].map((row) => (
            <span key={row} className="mt-[5%] flex gap-[6%]">
              <span className="block h-[0.55rem] w-[24%] max-h-[3%] rounded-full bg-[#1e3a5f]/40" />
              <span className="flex flex-1 flex-col gap-[0.25rem]">
                <span className="block h-1 rounded-full bg-stone-200" />
                <span className="block h-1 w-[85%] rounded-full bg-stone-200" />
              </span>
            </span>
          ))}
        </span>
      ) : (
        <span className="absolute inset-0 flex flex-col gap-[3.5%] px-[10%] pt-[10%]">
          <span className="mx-auto block h-[5%] w-[65%] rounded-full bg-stone-800" />
          <span className={cn(line, 'mx-auto w-[50%]')} />
          <span className="mt-[4%] block h-px w-full bg-stone-300" />
          <span className={cn(line, 'w-full')} />
          <span className={cn(line, 'w-[92%]')} />
          <span className="mt-[4%] block h-px w-full bg-stone-300" />
          <span className={cn(line, 'w-full')} />
          <span className={cn(line, 'w-[85%]')} />
          <span className={cn(line, 'w-[70%]')} />
        </span>
      )}
      <span className="sr-only">{name}</span>
    </span>
  )
}
