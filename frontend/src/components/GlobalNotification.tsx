import * as React from 'react'
import { showNotification } from '@mantine/notifications'
import { Outlet } from 'react-router-dom'

function GlobalNotification(): JSX.Element {
  React.useEffect(() => {
    window.addEventListener('offline', () => {
      showNotification({
        title: "You're offline",
        message: 'Please check your network'
      })
    })

    window.addEventListener('online', () => {
      showNotification({
        title: "You're online",
        message: 'Yay 😍😍😍'
      })
    })
  }, [])

  return <Outlet />
}

export default GlobalNotification
