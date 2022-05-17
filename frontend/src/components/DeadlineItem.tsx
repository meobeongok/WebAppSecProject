import { useUserStore } from '@/stores'
import type { Deadline } from '@/types/deadline'
import { Anchor, Text, createStyles } from '@mantine/core'
import { Link } from 'react-router-dom'
import RemainTime from './RemainTime'

interface DeadlineItemProps {
  deadline: Deadline
}

const useStyles = createStyles(() => ({
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  }
}))

function DeadlineItem({ deadline: { name, lesson, begin, end } }: DeadlineItemProps): JSX.Element {
  const { classes } = useStyles()
  const user = useUserStore((state) => state.user)

  if (user?.is_lecturer) {
    return (
      <div>
        <div className={classes.header}>
          <Anchor component={Link} to={`lessons/${lesson}/deadlines`}>
            {name}
          </Anchor>
          <Text>-</Text>
          <Text>{`${new Date(begin).toLocaleDateString()} ${new Date(begin).toLocaleTimeString()} - ${new Date(end).toLocaleDateString()} ${new Date(
            end
          ).toLocaleTimeString()}`}</Text>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className={classes.header}>
        <Anchor component={Link} to={`lessons/${lesson}/submitdeadline`}>
          {name}
        </Anchor>
        <Text>-</Text>
        <RemainTime begin={new Date(begin)} end={new Date(end)} />
      </div>
    </div>
  )
}

export default DeadlineItem
