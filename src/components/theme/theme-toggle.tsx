'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme, type Theme } from './theme-provider'

const OPTIONS: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
]

/**
 * Light / Dark / System choice. `compact` shows icons only (sidebar footer);
 * the full version adds labels (account settings).
 */
export function ThemeSwitcher({ compact = false, className }: { compact?: boolean; className?: string }) {
  const { theme, setTheme } = useTheme()

  return (
    <div
      role="radiogroup"
      aria-label="Choose theme"
      className={cn(
        'inline-flex items-center gap-0.5 rounded-lg border border-surface/70 bg-slate-900/[0.05] p-0.5 text-xs font-semibold text-slate-500',
        compact ? 'h-8' : 'h-10',
        className
      )}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = theme === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={compact ? label : undefined}
            title={compact ? label : undefined}
            onClick={() => setTheme(value)}
            className={cn(
              'inline-flex h-full items-center justify-center gap-1.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1 focus-visible:ring-offset-surface',
              compact ? 'w-8' : 'px-3',
              active ? 'bg-surface text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.12)]' : 'hover:text-slate-900'
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {compact ? null : <span>{label}</span>}
          </button>
        )
      })}
    </div>
  )
}

/** One-click switch between light and dark, for headers. */
export function ThemeToggleButton({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={label}
      title={label}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600',
        className
      )}
    >
      {/* Both icons render so the server HTML matches; CSS shows the right one before hydration. */}
      <Moon className="h-4 w-4 dark:hidden" aria-hidden="true" />
      <Sun className="hidden h-4 w-4 dark:block" aria-hidden="true" />
    </button>
  )
}
