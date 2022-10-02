import * as React from 'react'
import { NavBar } from '@/components'
import { createStyles } from '@mantine/core'
import { Outlet } from 'react-router-dom'
import { useAxiosInstance } from '@/hooks'
import { useUserStore } from '@/stores'
import { api } from '@/constants'
import type { User } from '@/types'

const useStyles = createStyles({
  content: {
    maxWidth: '80rem',
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: '3rem 1.5rem'
  }
})

function MainLayout(): JSX.Element {
  const { classes } = useStyles()

  const axiosInstance = useAxiosInstance()
  const setUser = useUserStore((state) => state.setUser)

  React.useEffect(() => {
    async function getUser(): Promise<void> {
      const data = await axiosInstance.get<User>(api.profile).then(({ data }) => ({
        ...data,
        image: import.meta.env.VITE_MEDIA_URL ?? document.domain + data.image
      }))
      setUser(data)
    }

    getUser()
  }, [])

  return (
    <>
      <NavBar />
      <div className={classes.content}>
        <Outlet />
      </div>
    </>
  )
}

export default MainLayout
