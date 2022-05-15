import * as React from 'react'
import { useParams } from 'react-router-dom'
import { useAxiosInstance } from '@/hooks'
import type { Lesson, LessonPayload } from '@/types'
import { api } from '@/constants'
import { Center, createStyles, Loader, Title } from '@mantine/core'
import { LessonItem } from '@/components'
import { fromLocationPayloads } from '@/helpers/location'

const useStyles = createStyles(() => ({
  items: {
    marginTop: '1rem'
  }
}))

function CourseLessons(): JSX.Element {
  const { classes } = useStyles()
  const { courseId } = useParams() as { courseId: string }
  const [isLoading, setLoading] = React.useState<boolean>(true)
  const [lessons, setLessons] = React.useState<Lesson[]>()
  const axiosInstance = useAxiosInstance()

  React.useEffect(() => {
    async function getLessons() {
      axiosInstance.get<LessonPayload[]>(`${api.courses}${courseId}/lessons/`).then(({ data }) => {
        const newData: Lesson[] = []

        for (const ls of data) {
          const newLs: Lesson = {
            ...ls,
            locationItems: fromLocationPayloads(ls.fileLesson)
          }

          newData.push(newLs)
        }

        setLessons(newData)
        setLoading(false)
      })
    }

    getLessons()
  }, [])

  if (isLoading) {
    return (
      <Center>
        <Loader />
      </Center>
    )
  }

  if (lessons && lessons.length > 0) {
    return (
      <div>
        <Title order={2}>All lessons</Title>
        <div className={classes.items}>
          {lessons.map((lesson) => (
            <LessonItem key={lesson.id} lesson={lesson} />
          ))}
        </div>
      </div>
    )
  }

  return <Center>This course has no lesson (￣ε(#￣)</Center>
}

export default CourseLessons
