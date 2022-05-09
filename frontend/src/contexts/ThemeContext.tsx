import * as React from 'react'
import { useLocalStorage } from '@mantine/hooks'
import { createContext } from '@/helpers'
import { ColorSchemeProvider, Global, MantineProvider } from '@mantine/core'
import { NotificationsProvider } from '@mantine/notifications'
import { globalStyles, overrideTheme } from '@/styles'

type Theme = 'light' | 'dark' | 'system'
type ActualTheme = 'light' | 'dark'

interface ThemeContextProps {
  children: JSX.Element
}

interface ThemeContextProviderProps {
  theme: Theme
  setTheme: (val: Theme | ((prevState: Theme) => Theme)) => void
}

function getActualTheme(theme: Theme): ActualTheme {
  return theme !== 'system' ? theme : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const [useTheme, ThemeContextProvider] = createContext<ThemeContextProviderProps>()

function ThemeProvider({ children }: ThemeContextProps): JSX.Element {
  const [theme, setTheme] = useLocalStorage<Theme>({ key: 'theme', defaultValue: 'system' })

  const [actualTheme, setActualTheme] = React.useState<ActualTheme>(getActualTheme(theme))

  function toggleTheme(actualTheme: ActualTheme) {
    setTheme(actualTheme)
    setActualTheme(actualTheme)
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    setActualTheme(getActualTheme(theme))
  })

  React.useEffect(() => {
    if (theme !== 'system' && theme !== 'light' && theme !== 'dark') {
      setTheme('system')
      setActualTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    } else {
      setActualTheme(getActualTheme(theme))
    }
  }, [theme])

  const value: ThemeContextProviderProps = {
    theme,
    setTheme
  }

  return (
    <ThemeContextProvider value={value}>
      <ColorSchemeProvider colorScheme={actualTheme} toggleColorScheme={toggleTheme}>
        <MantineProvider theme={{ colorScheme: actualTheme, ...overrideTheme }} withGlobalStyles withNormalizeCSS>
          <NotificationsProvider>
            <Global styles={globalStyles} />
            {children}
          </NotificationsProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </ThemeContextProvider>
  )
}

export default ThemeProvider
export { useTheme }
