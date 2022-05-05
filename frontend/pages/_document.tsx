import NextDocument, { Html, Head, Main, NextScript } from 'next/document'
import { createGetInitialProps } from '@mantine/next'

const getInitialProps = createGetInitialProps()

class Document extends NextDocument {
  static getInitialProps = getInitialProps

  render() {
    return (
      <Html lang="en">
        <Head>
          <link href="https://fonts.googleapis.com/css2?family=Cabin&display=swap" rel="stylesheet" />

          <link rel="apple-touch-icon" sizes="180x180" href="/logo/logo180.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/logo/logo16.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/logo/logo32.png" />
          <link rel="manifest" href="/manifest.webmanifest" />

          <meta name="theme-color" content="#212121" />
          <meta name="msapplication-config" content="/browserconfig.xml" />
          <meta name="msapplication-TileColor" content="#212121" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default Document
