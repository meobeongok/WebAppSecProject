import * as React from 'react'
import { Avatar, createStyles, Divider, Menu, Tooltip } from '@mantine/core'
import Logo from './Logo'
import ThemeButton from './ThemeButton'
import { Link, useNavigate } from 'react-router-dom'
import { useTokenStore, useUserStore } from '@/stores'
import { useAxiosInstance } from '@/hooks'
import { api } from '@/constants'

const useStyles = createStyles((theme) => ({
  wrapper: {
    backgroundColor: theme.colorScheme === 'light' ? '#ffffff' : '#262626',
    boxShadow: theme.shadows.xs,
    position: 'sticky',
    top: 0,
    zIndex: 100
  },

  container: {
    maxWidth: '80rem',
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: '0.5rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  logo: {
    width: '3.5rem'
  },

  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem'
  }
}))

function NavBar(): JSX.Element {
  const { classes } = useStyles()

  const navigate = useNavigate()
  const user = useUserStore((state) => state.user)
  const setUser = useUserStore((state) => state.setUser)
  const setAccessToken = useTokenStore((state) => state.setAccessToken)
  const axiosInstance = useAxiosInstance()

  async function handleSignOut(): Promise<void> {
    await axiosInstance.post(api.signOut).then(() => {
      setUser(undefined)
      setAccessToken(undefined)
      navigate('/signin', { replace: true })
    })
  }

  return (
    <div className={classes.wrapper}>
      <div className={classes.container}>
        <Link to="/">
          <Logo className={classes.logo} />
        </Link>
        <div className={classes.right}>
          <ThemeButton />

          {user && (
            <Menu
              control={
                <Tooltip label={user.name}>
                  <Avatar radius="xl" src={user.image} style={{ cursor: 'pointer' }} />
                </Tooltip>
              }
            >
              <Menu.Item>{user.name}</Menu.Item>
              <Divider />
              <Menu.Item>Your profile</Menu.Item>
              <Menu.Item>Your course</Menu.Item>
              <Menu.Item>Your deadlines</Menu.Item>
              <Divider />
              <Menu.Item onClick={handleSignOut}>Sign out</Menu.Item>
            </Menu>
          )}
        </div>
      </div>
    </div>
  )
}

export default NavBar
