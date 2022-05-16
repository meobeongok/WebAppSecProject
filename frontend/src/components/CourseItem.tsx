import type { Course } from '@/types'
import { Anchor, Avatar, Text, createStyles } from '@mantine/core'
import { Link } from 'react-router-dom'

interface CourseItemProps {
  course: Course
}

const useStyles = createStyles((theme) => ({
  container: {
    backgroundColor: theme.colorScheme === 'light' ? '#ffffff' : '#262626',
    padding: '1rem 3rem',
    boxShadow: theme.shadows.xs,
    borderRadius: theme.radius.md,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  courseName: {
    fontSize: theme.fontSizes.xl
  },
  lectureInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    paddingLeft: '0.75rem'
  }
}))

function CourseItem({ course: { name, id, course_lecturer: courseLecturer } }: CourseItemProps): JSX.Element {
  const { classes } = useStyles()

  return (
    <div className={classes.container}>
      <Anchor className={classes.courseName} component={Link} to={`/courses/${id}`}>
        {name}
      </Anchor>
      {courseLecturer.map((lecturer) => (
        <div key={lecturer.id}>
          <div className={classes.lectureInfo}>
            <Text>Lecture:</Text>
            <Avatar radius="xl" size="sm" src={lecturer.image && import.meta.env.VITE_MEDIA_URL + lecturer.image} />
            <Text>{lecturer.name}</Text>
          </div>
        </div>
      ))}
    </div>
  )
}

export default CourseItem
