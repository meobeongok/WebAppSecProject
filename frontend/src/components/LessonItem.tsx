import type { Lesson } from '@/types'
import { Anchor, Card, Text, createStyles } from '@mantine/core'
import { Link } from 'react-router-dom'
import LocationTreeView from './LocationTreeview'

interface LessonItemProps {
  lesson: Lesson
}

const useStyles = createStyles((theme) => ({
  container: {
    borderRadius: theme.radius.md,
    boxShadow: theme.shadows.xs,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  description: {
    paddingLeft: '0.75rem'
  },
  link: {
    fontSize: '1.1rem'
  }
}))

function LessonItem({ lesson: { name, id, description, locationItems } }: LessonItemProps): JSX.Element {
  const { classes } = useStyles()

  return (
    <Card className={classes.container}>
      <Anchor component={Link} to={`lessons/${id}`} className={classes.link}>
        {name}
      </Anchor>
      <Text className={classes.description}>{description}</Text>
      <LocationTreeView items={locationItems} />
    </Card>
  )
}

export default LessonItem
