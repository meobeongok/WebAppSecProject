import type * as React from 'react'
import type { NextPage as NextPageType } from 'next'
import type { AppProps as NextAppProps } from 'next/app'
import type { ColorScheme } from '@mantine/core'

type NextPage = NextPageType & {
  getLayout?: (page: JSX.Element) => React.ReactNode
}

type AppProps = NextAppProps & {
  savedColorScheme: ColorScheme
  Component: NextPage
}

export type { NextPage, AppProps }
