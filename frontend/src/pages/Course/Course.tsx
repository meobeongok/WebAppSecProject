import * as React from 'react'
import { Link, Outlet, useParams } from 'react-router-dom'
import { Button, Card, Center, createStyles, Loader, Title, Text, Avatar, Anchor } from '@mantine/core'
import { useAxiosInstance, usePageTitle } from '@/hooks'
import { api } from '@/constants'
import type { Course } from '@/types'
import { useUserStore } from '@/stores'

const useStyles = createStyles((theme) => ({
  notFoundContainer: {
    fontSize: '3rem'
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  content: {
    display: 'flex',
    marginTop: '3rem',
    gap: '1.5rem'
  },

  infoContainer: {
    width: '20rem',
    height: 'fit-content',

    [`@media (min-width: ${theme.breakpoints.md}px)`]: {
      width: '30rem'
    }
  },

  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    boxShadow: theme.shadows.xs,
    marginTop: '1rem',
    borderRadius: theme.radius.md
  },

  infoHeader: {
    fontWeight: 'bold'
  },

  infoItem: {
    paddingLeft: '1rem'
  },

  lecturerContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },

  lecturer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },

  lessons: {
    width: '100%'
  },

  links: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  }
}))

function CoursePage(): JSX.Element {
  const { courseId } = useParams() as { courseId: string }
  const [isLoading, setLoading] = React.useState<boolean>(true)
  const [course, setCourse] = React.useState<Course>()
  const [pageTitle, setPageTitle] = React.useState<string>('Course')
  const axiosInstance = useAxiosInstance()
  const { classes } = useStyles()
  const user = useUserStore((state) => state.user)

  usePageTitle(pageTitle)

  React.useEffect(() => {
    async function getCourse(): Promise<void> {
      await axiosInstance
        .get<Course>(`${api.courses}${courseId}/`)
        .then(({ data }) => {
          setCourse(data)
          setPageTitle(data.name)
        })
        .catch(() => {
          setPageTitle('Course not found')
        })

      setLoading(false)
    }

    getCourse()
  }, [])

  if (isLoading) {
    return (
      <Center>
        <Loader />
      </Center>
    )
  }

  if (course) {
    return (
      <div>
        <div className={classes.header}>
          <Title>{`${course.mskh} - ${course.name}`}</Title>
          {user && user.isLecturer && <Button>Edit course</Button>}
        </div>
        <div className={classes.content}>
          <div className={classes.infoContainer}>
            <Title order={2}>Info</Title>
            <Card className={classes.info}>
              <div>
                <Text className={classes.infoHeader}>Description</Text>
                <Text className={classes.infoItem}>{course.description}</Text>
              </div>

              <div className={classes.lecturerContainer}>
                <Text className={classes.infoHeader}>Lecturers</Text>
                {course.courseLecturer.map((lecturer) => (
                  <div className={`${classes.lecturer} ${classes.infoItem}`} key={lecturer.id}>
                    <Avatar radius="xl" size="sm" src={lecturer.image && import.meta.env.VITE_MEDIA_URL + lecturer.image} />
                    <Text>{lecturer.name}</Text>
                  </div>
                ))}
              </div>

              <div className={classes.links}>
                <Anchor component={Link} to="">
                  All lessons
                </Anchor>

                <Anchor component={Link} to="students">
                  All students
                </Anchor>
              </div>
            </Card>
          </div>
          <div className={classes.lessons}>
            <Outlet />
          </div>
        </div>
      </div>
    )
  }

  return <Center className={classes.notFoundContainer}>Course not found ¯\_(ツ)_/¯</Center>
}

export default CoursePage
