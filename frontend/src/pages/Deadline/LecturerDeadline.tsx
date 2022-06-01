import * as React from 'react'
import { useAxiosInstance } from '@/hooks'
import { useParams } from 'react-router-dom'
import type { Deadline, DeadlinePayload, DeadlineStudentSubmit, DeadlineStudentSubmitPayload } from '@/types/deadline'
import { fromLocationPayloads } from '@/helpers'
import { Card, Center, createStyles, Divider, Loader, Text, Title } from '@mantine/core'
import { LocationTreeview, RemainTime, StudentDeadlineSubmitItem } from '@/components'

const useStyles = createStyles(() => ({
  notFoundContainer: {
    fontSize: '3rem'
  },

  items: {
    display: 'flex',
    gap: '0.75rem',
    flexDirection: 'column'
  },

  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },

  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },

  remain: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },

  remainTitle: {
    fontSize: '26px',
    fontWeight: 700
  },

  description: {
    paddingLeft: '0.5rem'
  }
}))

function LecturerDeadline(): JSX.Element {
  const { classes } = useStyles()
  const { lessonId, deadlineId } = useParams() as { lessonId: string; deadlineId: string }
  const [isLoading, setLoading] = React.useState(true)
  const [isOverDue, setOverDue] = React.useState<boolean>(false)
  const [isStudentSubmitsLoading, setStudentSubmitsLoading] = React.useState(true)
  const [deadline, setDeadline] = React.useState<Deadline>()
  const [studentSubmits, setStudentSubmits] = React.useState<DeadlineStudentSubmit[]>()
  const axiosInstance = useAxiosInstance()

  function handleRemainTimeChange(isDeadlineOverDue: boolean): void {
    setOverDue(isDeadlineOverDue)
  }

  React.useEffect(() => {
    async function getStudentDeadlineStatus() {
      await axiosInstance.get<DeadlinePayload>(`/deadlineAPI/${lessonId}/lecturerDeadlines/${deadlineId}/`).then(({ data }) => {
        setDeadline({
          ...data,
          locationItems: fromLocationPayloads(data.file_deadline_lesson)
        })
      })

      setLoading(false)

      await axiosInstance
        .get<DeadlineStudentSubmitPayload[]>(`/deadlineAPI/${lessonId}/lecturerDeadlines/${deadlineId}/listStudentDeadlineStatus/`)
        .then(({ data }) => {
          setStudentSubmits(
            data.map((item) => ({
              ...item,
              file_deadlineSubmit_lesson: fromLocationPayloads(item.file_deadlineSubmit_lesson)
            }))
          )
        })

      setStudentSubmitsLoading(false)
    }

    getStudentDeadlineStatus()
  }, [])

  if (isLoading) {
    return (
      <Center>
        <Loader />
      </Center>
    )
  }

  if (deadline) {
    return (
      <div>
        <div className={classes.header}>
          <div className={classes.title}>
            <Title order={2}>{deadline.name}</Title>
            <Text className={classes.remainTitle}>-</Text>
            <div className={classes.remain}>
              <Text className={classes.remainTitle}>Remain time:</Text>
              <RemainTime
                className={classes.remainTitle}
                begin={new Date(deadline.begin)}
                end={new Date(deadline.end)}
                onTimeChange={handleRemainTimeChange}
              />
            </div>
          </div>
          <Text className={classes.description}>{deadline.description}</Text>
          {deadline.locationItems && deadline.locationItems.length > 0 && (
            <Card shadow="xs">
              <LocationTreeview items={deadline.locationItems} type="none" />
            </Card>
          )}
        </div>
        <Divider my="1.5rem" />

        {!isStudentSubmitsLoading ? (
          studentSubmits === undefined ? (
            <Center className={classes.notFoundContainer}>Not found any students ¯\_(ツ)_/¯</Center>
          ) : (
            <div className={classes.items}>
              {studentSubmits.map((studentSubmit) => (
                <StudentDeadlineSubmitItem key={studentSubmit.id} item={studentSubmit} isOverdue={isOverDue} />
              ))}
            </div>
          )
        ) : (
          <Center>
            <Loader />
          </Center>
        )}
      </div>
    )
  }

  return <Center className={classes.notFoundContainer}>Deadline not found ¯\_(ツ)_/¯</Center>
}

export default LecturerDeadline
