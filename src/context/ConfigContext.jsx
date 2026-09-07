import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { supabase } from '../supabaseClient'

const THEME_STORAGE_KEY = 'luxury_theme_mode'

export const DEFAULT_CONFIG = {
  store_name: "Maison de L'Élégance",
  brand_tagline: 'Haute Joaillerie & Horlogerie',
  currency_symbol: 'MAD',
  phone_number: '+212 522 000 000',
  whatsapp_number: '212600000000',
  location_city: 'Casablanca',
  theme_tokens: {
    gold_accent: '#C5A059',
    light: {
      bg: '#FAF8F5',
      text: '#1A1A1A',
      surface: '#FFFFFF',
      border: '#E5DFD5',
    },
    dark: {
      bg: '#0D0D0D',
      text: '#F4F1EA',
      surface: '#141414',
      border: '#262626',
    },
  },
}

export function applyThemeVariables(config, themeMode) {
  if (typeof document === 'undefined') return

  const themeTokens = config?.theme_tokens ?? DEFAULT_CONFIG.theme_tokens
  const fallbackTokens = DEFAULT_CONFIG.theme_tokens[themeMode]
  const modeTokens = themeTokens[themeMode] ?? fallbackTokens
  const root = document.documentElement

  root.style.setProperty('--bg-primary', modeTokens.bg ?? fallbackTokens.bg)
  root.style.setProperty('--text-primary', modeTokens.text ?? fallbackTokens.text)
  root.style.setProperty('--surface-primary', modeTokens.surface ?? fallbackTokens.surface)
  root.style.setProperty('--border-subtle', modeTokens.border ?? fallbackTokens.border)
  root.style.setProperty(
    '--accent-gold',
    themeTokens.gold_accent ?? DEFAULT_CONFIG.theme_tokens.gold_accent,
  )
}

function getInitialThemeMode() {
  if (typeof window === 'undefined') return 'dark'

  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    return storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'dark'
  } catch {
    console.warn('Unable to read the persisted luxury theme mode; using dark mode.')
    return 'dark'
  }
}

const initialThemeMode = getInitialThemeMode()
applyThemeVariables(DEFAULT_CONFIG, initialThemeMode)

export const ConfigContext = createContext(null)

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [themeMode, setThemeMode] = useState(initialThemeMode)

  const refetchConfig = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('site_config')
      .select('*')
      .single()

    if (fetchError) {
      const message = fetchError.message || 'Unable to load site configuration.'
      console.warn(`Supabase site configuration fallback: ${message}`)
      setError(message)
      setLoading(false)
      return
    }

    if (data) {
      setConfig({
        ...DEFAULT_CONFIG,
        ...data,
        theme_tokens: {
          ...DEFAULT_CONFIG.theme_tokens,
          ...data.theme_tokens,
          light: {
            ...DEFAULT_CONFIG.theme_tokens.light,
            ...data.theme_tokens?.light,
          },
          dark: {
            ...DEFAULT_CONFIG.theme_tokens.dark,
            ...data.theme_tokens?.dark,
          },
        },
      })
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    refetchConfig()
  }, [refetchConfig])

  useEffect(() => {
    applyThemeVariables(config, themeMode)
  }, [config, themeMode])

  const toggleTheme = useCallback(() => {
    setThemeMode((currentMode) => {
      const nextMode = currentMode === 'dark' ? 'light' : 'dark'

      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, nextMode)
      } catch {
        console.warn('Unable to persist the luxury theme mode.')
      }

      applyThemeVariables(config, nextMode)
      return nextMode
    })
  }, [config])

  return (
    <ConfigContext.Provider
      value={{ config, loading, error, themeMode, toggleTheme, refetchConfig }}
    >
      {children}
    </ConfigContext.Provider>
  )
}

export function useSiteConfig() {
  const context = useContext(ConfigContext)

  if (!context) {
    throw new Error('useSiteConfig must be used within a ConfigProvider')
  }

  return context
}
