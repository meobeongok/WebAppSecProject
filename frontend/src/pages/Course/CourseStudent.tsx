import * as React from 'react'
import { useParams } from 'react-router-dom'
import type { User } from '@/types'
import { useAxiosInstance } from '@/hooks'
import { api } from '@/constants'
import { Avatar, Card, Center, createStyles, Loader, Text, Title } from '@mantine/core'

const useStyles = createStyles((theme) => ({
  container: {
    borderRadius: theme.radius.md,
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '1rem',
    boxShadow: theme.shadows.xs
  },

  student: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  }
}))

function CourseStudent(): JSX.Element {
  const { classes } = useStyles()

  const { courseId } = useParams() as { courseId: string }
  const [isLoading, setLoading] = React.useState<boolean>(true)
  const [students, setStudents] = React.useState<User[]>()
  const axiosInstance = useAxiosInstance()

  React.useEffect(() => {
    async function getStudents(): Promise<void> {
      await axiosInstance
        .get<User[]>(`${api.courses}${courseId}/listMember/`)
        .then(({ data }) => {
          setStudents(data)
        })
        .catch()
        .then(() => setLoading(false))
    }

    getStudents()
  }, [])

  if (isLoading) {
    return (
      <Center>
        <Loader />
      </Center>
    )
  }

  if (students && students.length > 0) {
    return (
      <>
        <Title order={2}>All Students</Title>
        <Card className={classes.container}>
          {students.map((student) => (
            <div className={classes.student} key={student.id}>
              <Avatar radius="xl" size="sm" src={student.image && import.meta.env.VITE_MEDIA_URL + student.image} />
              <Text>{student.name}</Text>
            </div>
          ))}
        </Card>
      </>
    )
  }

  return <Center>This course does not have any students ¯\_(ツ)_/¯</Center>
}

export default CourseStudent
