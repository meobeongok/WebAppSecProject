import * as React from 'react'
import { Link, Outlet, useParams } from 'react-router-dom'
import { Button, Card, Center, createStyles, Loader, Title, Text, Avatar, Anchor, ActionIcon, Modal, TextInput, LoadingOverlay } from '@mantine/core'
import { useAxiosInstance, usePageTitle } from '@/hooks'
import { api } from '@/constants'
import type { Course } from '@/types'
import { useUserStore } from '@/stores'
import { useEdit } from '@/contexts'
import { FiEdit } from 'react-icons/fi'
import { useForm } from '@mantine/form'
import { showNotification } from '@mantine/notifications'
import { useDisclosure } from '@mantine/hooks'

const useStyles = createStyles((theme) => ({
  notFoundContainer: {
    fontSize: '3rem'
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  content: {
    display: 'flex',
    marginTop: '3rem',
    gap: '1.5rem'
  },

  infoContainer: {
    width: '20rem',
    height: 'fit-content',

    [`@media (min-width: ${theme.breakpoints.md}px)`]: {
      width: '30rem'
    }
  },

  infoTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },

  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    boxShadow: theme.shadows.xs,
    marginTop: '1rem',
    borderRadius: theme.radius.md
  },

  infoHeader: {
    fontWeight: 'bold'
  },

  infoItem: {
    paddingLeft: '1rem'
  },

  lecturerContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },

  lecturer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },

  lessons: {
    width: '100%'
  },

  links: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },

  formButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    alignSelf: 'flex-end',
    marginTop: '0.5rem'
  }
}))

function CoursePage(): JSX.Element {
  const { courseId } = useParams() as { courseId: string }
  const [isLoading, setLoading] = React.useState<boolean>(true)
  const [course, setCourse] = React.useState<Course>()
  const [pageTitle, setPageTitle] = React.useState<string>('Course')
  const axiosInstance = useAxiosInstance()
  const { classes } = useStyles()
  const user = useUserStore((state) => state.user)
  const { isInEditingMode, setInEditingMode } = useEdit()

  const [isFormSubmitting, setFormSubmitting] = React.useState<boolean>(false)
  const [isCourseEditOpened, courseEditHandler] = useDisclosure(false, {
    onClose: () => {
      if (course !== undefined) {
        editCourseForm.setValues({
          mskh: course.mskh,
          name: course.name,
          description: course.description
        })
      }
      setFormSubmitting(false)
    }
  })

  const editCourseForm = useForm({
    initialValues: {
      mskh: '',
      name: '',
      description: ''
    },
    validate: {
      name: (value) => (value === '' ? 'Name must not empty' : undefined)
    }
  })

  function handleToggleEditingMode(): void {
    setInEditingMode((previousValue) => !previousValue)
  }

  function handleEditCourse(e: React.FormEvent): void {
    e.preventDefault()

    const { hasErrors } = editCourseForm.validate()
    if (hasErrors) return

    setFormSubmitting(true)

    axiosInstance
      .put<Course>(`${api.courses}${courseId}/`, { ...editCourseForm.values })
      .then(({ data }) => {
        setCourse(data)
        setPageTitle(data.name)

        showNotification({
          title: 'Edit course successfully 😒',
          message: 'Yay 😍😍😍'
        })
      })
      .catch(() =>
        showNotification({
          color: 'red',
          title: 'Edit course false 😒',
          message: 'Please try again'
        })
      )
      .then(() => courseEditHandler.close())
  }

  usePageTitle(pageTitle)

  React.useEffect(() => {
    async function getCourse(): Promise<void> {
      await axiosInstance
        .get<Course>(`${api.courses}${courseId}/`)
        .then(({ data }) => {
          setCourse(data)
          setPageTitle(data.name)
        })
        .catch(() => {
          setPageTitle('Course not found')
        })
        .then(() => setLoading(false))
    }

    getCourse()
  }, [])

  React.useEffect(() => {
    if (course !== undefined) {
      editCourseForm.setValues({
        mskh: course.mskh,
        name: course.name,
        description: course.description
      })
    }
  }, [course])

  if (isLoading) {
    return (
      <Center>
        <Loader />
      </Center>
    )
  }

  if (course) {
    return (
      <>
        <div>
          <div className={classes.header}>
            <Title>{`${course.mskh} - ${course.name}`}</Title>
            {user &&
              user.is_lecturer &&
              (isInEditingMode ? (
                <Button variant="outline" color="red" onClick={handleToggleEditingMode}>
                  Exit edit mode
                </Button>
              ) : (
                <Button onClick={handleToggleEditingMode}>Enter edit mode</Button>
              ))}
          </div>
          <div className={classes.content}>
            <div className={classes.infoContainer}>
              <div className={classes.infoTitle}>
                <Title order={2}>Info</Title>
                {isInEditingMode && (
                  <ActionIcon onClick={courseEditHandler.open}>
                    <FiEdit />
                  </ActionIcon>
                )}
              </div>
              <Card className={classes.info}>
                <div>
                  <Text className={classes.infoHeader}>Description</Text>
                  <Text className={classes.infoItem}>{course.description}</Text>
                </div>

                <div className={classes.lecturerContainer}>
                  <Text className={classes.infoHeader}>Lecturers</Text>
                  {course.course_lecturer.map((lecturer) => (
                    <div className={`${classes.lecturer} ${classes.infoItem}`} key={lecturer.id}>
                      <Avatar radius="xl" size="sm" src={lecturer.image && import.meta.env.VITE_MEDIA_URL + lecturer.image} />
                      <Text>{lecturer.name}</Text>
                    </div>
                  ))}
                </div>

                <div className={classes.links}>
                  <Anchor component={Link} to="">
                    All lessons
                  </Anchor>

                  <Anchor component={Link} to="students">
                    All students
                  </Anchor>
                </div>
              </Card>
            </div>
            <div className={classes.lessons}>
              <Outlet />
            </div>
          </div>
        </div>
        <Modal centered opened={isCourseEditOpened} onClose={courseEditHandler.close} title={`Edit ${course.name}`}>
          <form className={classes.form} onSubmit={handleEditCourse}>
            <TextInput required label="Course name" {...editCourseForm.getInputProps('name')} />
            <TextInput label="Course description" {...editCourseForm.getInputProps('description')} />
            <div className={classes.formButton}>
              <Button variant="outline" color="red" onClick={courseEditHandler.close}>
                Cancel
              </Button>
              <Button type="submit">Edit</Button>
            </div>
          </form>
          <LoadingOverlay visible={isFormSubmitting} />
        </Modal>
      </>
    )
  }

  return <Center className={classes.notFoundContainer}>Course not found ¯\_(ツ)_/¯</Center>
}

export default CoursePage
