'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'cv-tracker-theme'
const THEME_EVENT = 'cv-tracker-theme-change'
const DARK_QUERY = '(prefers-color-scheme: dark)'

/*
 * Runs in <head> before the first paint, so a dark page never flashes white.
 * Keep it in sync with applyTheme below.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{var s=localStorage.getItem('${THEME_STORAGE_KEY}');var d=s==='dark'||(s!=='light'&&window.matchMedia('${DARK_QUERY}').matches);var e=document.documentElement;e.classList.toggle('dark',d);e.style.colorScheme=d?'dark':'light'}catch(x){}})()`

// Fallback when localStorage is blocked (some private modes): the choice lasts until reload.
let memoryTheme: Theme = 'system'

function readTheme(): Theme {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY)
    return saved === 'light' || saved === 'dark' ? saved : 'system'
  } catch {
    return memoryTheme
  }
}

// The store is the saved choice plus the OS setting, as one string so React can compare snapshots.
function getSnapshot() {
  return `${readTheme()}:${window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'}`
}

function getServerSnapshot() {
  return 'system:light'
}

function subscribe(onChange: () => void) {
  const media = window.matchMedia(DARK_QUERY)
  media.addEventListener('change', onChange)
  // `storage` fires when another tab changes the theme; THEME_EVENT when this tab does.
  window.addEventListener('storage', onChange)
  window.addEventListener(THEME_EVENT, onChange)
  return () => {
    media.removeEventListener('change', onChange)
    window.removeEventListener('storage', onChange)
    window.removeEventListener(THEME_EVENT, onChange)
  }
}

function applyTheme(resolved: ResolvedTheme) {
  const root = document.documentElement
  const isDark = resolved === 'dark'
  if (root.classList.contains('dark') === isDark && root.style.colorScheme === resolved) return

  // Recolour in one step instead of letting every transition-colors element fade separately.
  root.classList.add('theme-switching')
  root.classList.toggle('dark', isDark)
  root.style.colorScheme = resolved
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => root.classList.remove('theme-switching'))
  })
}

type ThemeContextValue = {
  /** The saved choice: light, dark, or follow the operating system. */
  theme: Theme
  /** What is actually shown right now. */
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [theme, system] = snapshot.split(':') as [Theme, ResolvedTheme]
  const resolvedTheme: ResolvedTheme = theme === 'system' ? system : theme

  useEffect(() => {
    applyTheme(resolvedTheme)
  }, [resolvedTheme])

  const setTheme = useCallback((next: Theme) => {
    memoryTheme = next
    try {
      if (next === 'system') window.localStorage.removeItem(THEME_STORAGE_KEY)
      else window.localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Storage is blocked; readTheme falls back to memoryTheme.
    }
    window.dispatchEvent(new Event(THEME_EVENT))
  }, [])

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme, setTheme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used inside ThemeProvider')
  return context
}
