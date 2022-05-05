import * as React from 'react'
import { getCookie, setCookies } from 'cookies-next'
import { getMainLayout } from '@/layouts'
import { ColorSchemeProvider, Global, MantineProvider, type ColorScheme } from '@mantine/core'
import { globalStyles, theme } from '@/styles'
import type { AppProps } from '@/types/next'
import type { GetServerSidePropsContext } from 'next'

function App({ Component, pageProps, savedColorScheme }: AppProps) {
  const [colorScheme, setColorScheme] = React.useState<ColorScheme>(savedColorScheme)

  const getLayout = Component.getLayout || getMainLayout

  function toggleColorScheme(value?: ColorScheme): void {
    const nextColorScheme = value || (colorScheme === 'dark' ? 'light' : 'dark')
    setColorScheme(nextColorScheme)
    setCookies('color-scheme', nextColorScheme, { maxAge: 60 * 60 * 24 * 30 })
  }

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider theme={{ colorScheme, ...theme }} withGlobalStyles withNormalizeCSS>
        <Global styles={globalStyles} />
        {getLayout(<Component {...pageProps} />)}
      </MantineProvider>
    </ColorSchemeProvider>
  )
}

App.getInitialProps = ({ ctx }: { ctx: GetServerSidePropsContext }) => ({
  savedColorScheme: getCookie('color-scheme', ctx) === 'dark' ? 'dark' : 'light'
})

export default App
