import * as React from 'react'
import { useTokenStore } from '@/stores'
import { useAxiosInstance } from '@/hooks'
import { LoadingOverlay } from '@mantine/core'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { api } from '@/constants'
import type { TokenPayload } from '@/types'

function PrivateElement(): JSX.Element {
  const [isAuthComplete, setAuthComplete] = React.useState<boolean>(false)

  const location = useLocation()

  const axiosInstance = useAxiosInstance()

  const accessToken = useTokenStore((state) => state.accessToken)
  const setAccessToken = useTokenStore((state) => state.setAccessToken)

  React.useEffect(() => {
    async function getTokens(): Promise<void> {
      try {
        if (accessToken) {
          setTimeout(() => setAuthComplete(true), 500)
          return
        }

        const data = await axiosInstance.post<TokenPayload>(api.refresh).then(({ data }) => data)
        setAccessToken(data.access)

        setTimeout(() => setAuthComplete(true), 500)
      } catch {
        setAuthComplete(true)
      }
    }

    getTokens()
  }, [accessToken])

  if (!isAuthComplete) return <LoadingOverlay visible />

  return accessToken ? <Outlet /> : <Navigate to="/signin" state={{ from: location }} />
}

export default PrivateElement
