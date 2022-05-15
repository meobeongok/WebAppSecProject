import * as React from 'react'
import { useAxiosInstance, usePageTitle } from '@/hooks'
import { api } from '@/constants'
import { createStyles, Indicator, Paper, Skeleton, Title } from '@mantine/core'
import { CourseItem } from '@/components'
import { Calendar } from '@mantine/dates'
import { useUserStore } from '@/stores'
import type { Course } from '@/types'
import type { Deadline } from '@/types/deadline'

const useStyles = createStyles(() => ({
  container: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '3rem'
  },

  courses: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },

  calendarContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  }
}))

function Home(): JSX.Element {
  usePageTitle('Home')

  const { classes } = useStyles()

  const [courses, setCourses] = React.useState<Course[]>()
  const [deadlines, setDeadlines] = React.useState<Deadline[]>()

  const axiosInstance = useAxiosInstance()

  const user = useUserStore((state) => state.user)

  React.useEffect(() => {
    async function getCourses(): Promise<void> {
      const coursesData = await axiosInstance.get<Course[]>(api.courses).then(({ data }) => data)
      setCourses(coursesData)

      // const deadlines = await axiosInstance.get(api.deadlines).then(({ data }) => data)
      // console.log(deadlines)
    }

    getCourses()
  }, [])

  React.useEffect(() => {
    async function getDeadlines(): Promise<void> {
      if (!user) return

      if (user.isLecturer) setDeadlines([])

      const deadlines = await axiosInstance.get<Deadline[]>(api.deadlines).then(({ data }) => data)
      setDeadlines(deadlines)
    }

    getDeadlines()
  }, [user])

  return (
    <div>
      <div className={classes.container}>
        <div className={classes.courses}>
          <Title>All Courses</Title>
          {courses ? (
            courses.map((course) => <CourseItem key={course.mskh} course={course} />)
          ) : (
            <>
              <div>
                <Skeleton height={50} circle />
                <Skeleton height={8} mt={6} radius="xl" />
                <Skeleton height={8} mt={6} radius="xl" />
                <Skeleton height={8} mt={6} width="70%" radius="xl" />
              </div>
              <div>
                <Skeleton height={50} circle />
                <Skeleton height={8} mt={6} radius="xl" />
                <Skeleton height={8} mt={6} radius="xl" />
                <Skeleton height={8} mt={6} width="70%" radius="xl" />
              </div>
            </>
          )}
        </div>
        {deadlines && (
          <div className={classes.calendarContainer}>
            <Title order={2}>Deadlines</Title>
            <Paper>
              <Calendar
                allowLevelChange={false}
                amountOfMonths={1}
                renderDay={(date) => {
                  const day = date.getDate()
                  const month = date.getMonth()
                  const year = date.getFullYear()

                  const deadline = deadlines.find((deadline) => {
                    const deadlineDate = new Date(deadline.deadline.end)
                    return day === deadlineDate.getDate() && month === deadlineDate.getMonth() && year === deadlineDate.getFullYear()
                  })

                  return (
                    <Indicator size={6} color={deadline?.isFinished ? 'green' : 'red'} offset={8} disabled={deadline === undefined}>
                      <div>{day}</div>
                    </Indicator>
                  )
                }}
              />
            </Paper>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
