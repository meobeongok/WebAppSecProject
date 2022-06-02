import * as React from 'react'
import { useAxiosInstance } from '@/hooks'
import { api } from '@/constants'
import { Anchor, Card, Center, createStyles, Loader, Text } from '@mantine/core'
import { Link } from 'react-router-dom'
import { RemainTime } from '@/components'
import type { DeadlineSubmitProfile } from '@/types/deadline'

const useStyles = createStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    position: 'relative',
    padding: '0.25rem',
    borderRadius: theme.radius.md,

    '&:hover .group-hover': {
      visibility: 'visible'
    },

    ':hover': {
      backgroundColor: theme.colorScheme === 'light' ? '#00000010' : 'ffffff10'
    }
  },
  description: {
    paddingLeft: '0.75rem'
  },

  items: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  }
}))

function UserDeadlines(): JSX.Element {
  const { classes } = useStyles()

  const [isLoading, setLoading] = React.useState(true)
  const [deadlines, setDeadlines] = React.useState<DeadlineSubmitProfile[]>()
  const axiosInstance = useAxiosInstance()

  React.useEffect(() => {
    async function getDeadlines() {
      await axiosInstance
        .get<DeadlineSubmitProfile[]>(api.deadlines)
        .then(({ data }) => setDeadlines(data))
        .catch()
        .then(() => setLoading(false))
    }

    getDeadlines()
  }, [])

  if (isLoading) {
    return (
      <Center>
        <Loader />
      </Center>
    )
  }

  if (deadlines !== undefined && deadlines.length > 0) {
    return (
      <div className={classes.items}>
        {deadlines.map(({ deadline: { lesson, name, is_finished, end, begin, description }, id }) => (
          <Card shadow="xs">
            <div className={classes.container}>
              <div className={classes.header}>
                <Anchor component={Link} to={`/courses/${lesson.course.id}/lessons/${lesson.id}/submitdeadline/${id}`}>
                  {name}
                </Anchor>
                <Text>-</Text>
                <RemainTime begin={new Date(begin)} end={new Date(end)} is_finished={is_finished} />
              </div>
              {description && <Text className={classes.description}>{description}</Text>}
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return <div>ád</div>
}

export default UserDeadlines
