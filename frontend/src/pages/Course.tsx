import * as React from 'react'
import { useParams } from 'react-router-dom'
import type { Course } from '@/types'
import { Center, Loader } from '@mantine/core'

function CoursePage(): JSX.Element {
  const { courseId } = useParams() as { courseId: string }
  const [isLoading, setLoading] = React.useState<boolean>(true)
  const [course, setCourse] = React.useState<Course>()

  if (isLoading) {
    return (
      <Center>
        <Loader />
      </Center>
    )
  }
}

export default CoursePage
