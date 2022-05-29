import * as React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'
import { api } from '@/constants'
import { useTokenStore } from '@/stores'
import { axiosInstance } from '@/utils'
import type { TokenPayload } from '@/types'
import { showNotification } from '@mantine/notifications'

function useAxiosInstance() {
  const navigate = useNavigate()
  const location = useLocation()
  const accessToken = useTokenStore((state) => state.accessToken)
  const setAccessToken = useTokenStore((state) => state.setAccessToken)

  React.useEffect(() => {
    if (!accessToken) return

    const requestIntercept = axiosInstance.interceptors.request.use(
      (request: AxiosRequestConfig) => {
        if (!request.headers) request.headers = {}
        request.headers['Authorization'] = `Bearer ${accessToken}`

        return request
      },
      (error) => Promise.reject(error)
    )

    const responseIntercept = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        try {
          if (error.status !== '400') return Promise.reject(error)

          const data = await axios.post<TokenPayload>(import.meta.env.VITE_BACKEND_URL + api.refresh).then(({ data }) => data)
          setAccessToken(data.access)

          // Resend request
          const config = error.config
          if (!config.headers) config.headers = {}
          config.headers['Authorization'] = `Bearer ${data.access}`

          axios.request(config)
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            setAccessToken(undefined)
            showNotification({
              title: 'Token Expired',
              message: 'Please login again 🥲',
              color: 'red'
            })
            navigate('/signin', { state: { from: location }, replace: true })
          } else Promise.reject(error)
        }
      }
    )

    return () => {
      axiosInstance.interceptors.request.eject(requestIntercept)
      axiosInstance.interceptors.response.eject(responseIntercept)
    }
  }, [accessToken])

  return axiosInstance
}

export { useAxiosInstance }
