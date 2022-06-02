import { useUserStore } from '@/stores'
import { ActionIcon, Avatar, Center, createStyles, Tabs, Text, Title } from '@mantine/core'
import * as React from 'react'
import { FiAtSign, FiFlag, FiUser } from 'react-icons/fi'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

const useStyles = createStyles((theme) => ({
  container: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gap: '7rem'
  },

  image: {
    width: '20rem',
    height: '20rem'
  },
  role: {
    fontWeight: 600
  },

  info: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    marginLeft: '-8px'
  },

  tabLabel: {
    fontSize: theme.fontSizes.lg
  },

  tabContent: {
    marginTop: '1.5rem'
  },

  profile: {
    padding: '3rem 0.5rem'
  },

  text: {
    fontSize: '3rem'
  }
}))

function getTabIndex(pathname: string) {
  if (pathname === '/user' || pathname === '/user/profile') return 0
  if (pathname === '/user/courses') return 1
  return 2
}

function getUserGender(gender: 'male' | 'female' | 'none') {
  if (gender === 'male') return 'Male'
  if (gender === 'female') return 'Female'
  return 'Prefer not to say 😜'
}

function UserInfo(): JSX.Element {
  const user = useUserStore((state) => state.user)
  const { classes } = useStyles()

  const location = useLocation()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = React.useState(getTabIndex(location.pathname))

  function handleChangeTab(active: number, tabKey: string): void {
    setActiveTab(active)
    navigate(tabKey)
  }

  React.useEffect(() => {
    setActiveTab(getTabIndex(location.pathname))
  }, [location.pathname])

  if (user === undefined)
    return (
      <Center>
        <Text>User not found ¯\_(ツ)_/¯</Text>
      </Center>
    )

  return (
    <div className={classes.container}>
      <div>
        <Avatar src={user.image} className={classes.image} radius="xl" />
        <Title order={1}>{user.name}</Title>
        <div className={classes.info}>
          <ActionIcon variant="hover" color="grape">
            <FiUser />
          </ActionIcon>
          <Text className={classes.role}>{user.is_lecturer ? 'Lecturer' : 'Student'}</Text>
        </div>
        <div className={classes.info}>
          <ActionIcon variant="hover" color="grape">
            <FiAtSign />
          </ActionIcon>
          <Text>{user.email}</Text>
        </div>
        <div className={classes.info}>
          <ActionIcon variant="hover" color="grape">
            <FiFlag />
          </ActionIcon>
          <Text>{getUserGender(user.gender)}</Text>
        </div>
      </div>
      <div>
        <Tabs active={activeTab} color="blue" grow onTabChange={handleChangeTab}>
          <Tabs.Tab className={classes.tabLabel} label="Profile" tabKey="/user">
            <Center className={classes.profile}>
              <Text className={classes.text}>Nothing in here 🥱</Text>
            </Center>
          </Tabs.Tab>
          <Tabs.Tab className={classes.tabLabel} label="Courses" tabKey="/user/courses" />
          {!user.is_lecturer && <Tabs.Tab className={classes.tabLabel} label="Deadlines" tabKey="/user/deadlines" />}
        </Tabs>
        <div className={classes.tabContent}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default UserInfo
