import * as React from 'react'
import { useTokenStore, useUserStore } from '@/stores'
import { useAxiosInstance } from '@/hooks'
import { LoadingOverlay } from '@mantine/core'
import { matchRoutes, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { api } from '@/constants'
import type { TokenPayload } from '@/types'
import { useEdit } from '@/contexts'

const studentRoutes = [{ path: '/courses/:courseId/lessons/:lessonId/submitdeadline/:submitId' }, { path: '/user/deadlines' }]
const lecturerRoutes = [{ path: 'lessons/:lessonId/deadlines/:deadlineId' }]

function PrivateElement(): JSX.Element {
  const [isAuthComplete, setAuthComplete] = React.useState<boolean>(false)

  const location = useLocation()
  const navigate = useNavigate()
  const { isInEditingMode, setInEditingMode } = useEdit()

  const axiosInstance = useAxiosInstance()

  const user = useUserStore((state) => state.user)
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

  React.useEffect(() => {
    if (user === undefined) return
    if (user.is_lecturer) {
      if (matchRoutes(studentRoutes, location)) {
        navigate('/404', { replace: true })
      }
    } else {
      if (matchRoutes(lecturerRoutes, location)) {
        navigate('/404', { replace: true })
      }
    }
  }, [user, location.pathname])

  React.useEffect(() => {
    if (user === undefined) return
    if (!user.is_lecturer) {
      if (!matchRoutes(studentRoutes.slice(0, 1), location) && isInEditingMode) {
        setInEditingMode(false)
      }
    }
  }, [user, location.pathname])

  if (!isAuthComplete) return <LoadingOverlay visible />

  return accessToken ? <Outlet /> : <Navigate to="/signin" state={{ from: location }} />
}

export default PrivateElement
