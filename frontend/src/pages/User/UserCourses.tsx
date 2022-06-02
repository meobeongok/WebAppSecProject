import * as React from 'react'
import { useAxiosInstance } from '@/hooks'
import type { Course } from '@/types'
import { api } from '@/constants'
import { Center, createStyles, Loader } from '@mantine/core'
import { CourseItem } from '@/components'

const useStyles = createStyles(() => ({
  notFoundContainer: {
    fontSize: '3rem'
  },

  items: {
    display: 'flex',
    gap: '0.75rem',
    flexDirection: 'column'
  }
}))

function UserCourse(): JSX.Element {
  const [isLoading, setLoading] = React.useState<boolean>(true)
  const [courses, setCourses] = React.useState<Course[]>()
  const axiosInstance = useAxiosInstance()
  const { classes } = useStyles()

  React.useEffect(() => {
    async function getUserCourses() {
      await axiosInstance
        .get<Course[]>(api.courses)
        .then(({ data }) => {
          setCourses(data)
        })
        .catch()
        .then(() => setLoading(false))
    }

    getUserCourses()
  }, [])

  if (isLoading)
    return (
      <Center>
        <Loader />
      </Center>
    )

  if (courses === undefined) return <Center className={classes.notFoundContainer}>Course not found ¯\_(ツ)_/¯</Center>

  return (
    <div className={classes.items}>
      {courses.map((course) => (
        <CourseItem key={course.mskh} course={course} />
      ))}
    </div>
  )
}

export default UserCourse
