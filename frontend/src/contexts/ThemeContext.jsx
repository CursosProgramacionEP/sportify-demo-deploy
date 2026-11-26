import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ThemeContext } from './theme-context.js'

const THEME_STORAGE_KEY = 'sportify-theme'
const THEMES = ['light', 'dark']

function readStoredTheme() {
  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    return THEMES.includes(storedTheme) ? storedTheme : null
  } catch {
    return null
  }
}

function getSystemTheme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light'
  const initializedTheme = document.documentElement.dataset.theme
  if (THEMES.includes(initializedTheme)) return initializedTheme
  return readStoredTheme() ?? getSystemTheme()
}

export default function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme)
  const hasManualPreference = useRef(null)
  if (hasManualPreference.current === null) {
    hasManualPreference.current = readStoredTheme() !== null
  }

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme
    root.style.colorScheme = theme
  }, [theme])

  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!mediaQuery) return undefined

    const applySystemTheme = (event) => {
      if (!hasManualPreference.current && readStoredTheme() === null) {
        setThemeState(event.matches ? 'dark' : 'light')
      }
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', applySystemTheme)
      return () => mediaQuery.removeEventListener('change', applySystemTheme)
    }

    mediaQuery.addListener?.(applySystemTheme)
    return () => mediaQuery.removeListener?.(applySystemTheme)
  }, [])

  const setTheme = useCallback((nextTheme) => {
    if (!THEMES.includes(nextTheme)) return

    hasManualPreference.current = true
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
    } catch {
      // The theme still changes for this session when storage is unavailable.
    }

    setThemeState(nextTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [setTheme, theme])

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
