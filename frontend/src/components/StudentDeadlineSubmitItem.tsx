import type { DeadlineStudentSubmit } from '@/types/deadline'
import { Avatar, Card, createStyles, Divider, Text } from '@mantine/core'
import LocationTreeView from './LocationTreeview'

interface StudentDeadlineSubmitItemProps {
  item: DeadlineStudentSubmit
  isOverdue: boolean
}

const useStyles = createStyles(() => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },

  status: {
    display: 'inline-block',
    fontWeight: 600
  },

  header: {
    fontWeight: 600,
    marginTop: '0.5rem'
  }
}))

function StudentDeadlineSubmitItem({
  item: { is_finished, file_deadlineSubmit_lesson, member },
  isOverdue
}: StudentDeadlineSubmitItemProps): JSX.Element {
  const { classes } = useStyles()

  return (
    <Card className={classes.container} shadow="xs" radius="md">
      <div className={classes.title}>
        <Avatar src={import.meta.env.VITE_MEDIA_URL + member.image} radius="xl" />
        <Text>{member.name}</Text>
      </div>
      <Text>
        Is finished:{' '}
        <Text className={classes.status} color={is_finished ? 'green' : 'red'}>
          {is_finished ? 'Finished' : isOverdue ? "Did't submit 😡" : 'Not finished'}
        </Text>
      </Text>
      {file_deadlineSubmit_lesson && file_deadlineSubmit_lesson.length > 0 && (
        <div>
          <Text className={classes.header}>Submitted files</Text>
          <Divider my="sm" mx="1rem" />
          <LocationTreeView items={file_deadlineSubmit_lesson} type="none" />
        </div>
      )}
    </Card>
  )
}

export default StudentDeadlineSubmitItem
