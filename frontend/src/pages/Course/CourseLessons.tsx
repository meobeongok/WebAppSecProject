import * as React from 'react'
import { useParams } from 'react-router-dom'
import { useAxiosInstance } from '@/hooks'
import type { File, Lesson, LessonPayload } from '@/types'
import { api } from '@/constants'
import { Button, Card, Center, createStyles, Loader, LoadingOverlay, Modal, TextInput, Title, Tooltip } from '@mantine/core'
import { LessonItem } from '@/components'
import { fromLocationPayloads } from '@/helpers/location'
import { useEdit } from '@/contexts'
import { FiPlus } from 'react-icons/fi'
import axios, { type CancelTokenSource } from 'axios'
import { useForm } from '@mantine/form'
import { showNotification } from '@mantine/notifications'
import { addFileToLessons, deleteLessonFile } from '@/helpers'

const useStyles = createStyles((theme) => ({
  items: {
    marginTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },

  addLesson: {
    cursor: 'pointer',
    boxShadow: theme.shadows.xs
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

function CourseLessons(): JSX.Element {
  const { classes } = useStyles()
  const { courseId } = useParams() as { courseId: string }
  const [isLoading, setLoading] = React.useState<boolean>(true)
  const [lessons, setLessons] = React.useState<Lesson[]>([])
  const axiosInstance = useAxiosInstance()
  const { isInEditingMode } = useEdit()
  const [isCreateLessonOpened, setCreateLessonOpened] = React.useState<boolean>(false)
  const [isCreateLessonSubmitting, setCreateLessonSubmitting] = React.useState<boolean>(false)

  const createLessonForm = useForm({
    initialValues: {
      name: '',
      description: ''
    },
    validate: {
      name: (value) => (value === '' ? 'Name must not empty' : undefined)
    }
  })

  const axiosCancelToken = axios.CancelToken.source()

  function handleCreateLesson(e: React.FormEvent): void {
    e.preventDefault()

    const { hasErrors } = createLessonForm.validate()
    if (hasErrors) return

    setCreateLessonSubmitting(true)

    axiosInstance
      .post<Lesson>(`${api.courses}${courseId}/lessons/`, { ...createLessonForm.values, cancelToken: axiosCancelToken })
      .then(({ data }) => {
        setLessons((previousValue) => {
          const newLessons = [...previousValue]
          newLessons.push(data)
          return newLessons
        })

        showNotification({
          title: 'Create a new lesson success 😆',
          message: 'Yay 😍😍😍'
        })

        createLessonForm.setValues({ name: '', description: '' })
      })
      .catch(() =>
        showNotification({
          color: 'red',
          title: 'Create a new lesson failed 😨',
          message: 'Please try again'
        })
      )

    setCreateLessonOpened(false)
    setCreateLessonSubmitting(false)
  }

  function handleEditLesson(lessonId: number, cancelToken: CancelTokenSource, values: Record<string, string>): void {
    axiosInstance
      .put<LessonPayload>(`${api.courses}${courseId}/lessons/${lessonId}/`, { ...values, cancelToken: cancelToken.token })
      .then(({ data }) => {
        setLessons((previousValue) => {
          const newLessons = previousValue.map((lesson) =>
            lesson.id === data.id
              ? {
                  ...data,
                  locationItems: fromLocationPayloads(data.file_lesson)
                }
              : lesson
          )
          return newLessons
        })

        showNotification({
          title: 'Edit a lesson success 😆',
          message: 'Yay 😍😍😍'
        })
      })
      .catch(() =>
        showNotification({
          color: 'red',
          title: 'Edit a lesson failed 😨',
          message: 'Please try again'
        })
      )
  }

  async function handleDeleteLesson(lessonId: number, cancelToken: CancelTokenSource) {
    axiosInstance
      .delete(`${api.courses}${courseId}/lessons/${lessonId}/`, { cancelToken: cancelToken.token })
      .then(() => {
        setLessons((previousValue) => {
          const newLessons = previousValue.filter((lesson) => lesson.id !== lessonId)
          return newLessons
        })

        showNotification({
          title: 'Delete a lesson success 😆',
          message: 'Yay 😍😍😍'
        })
      })
      .catch(() =>
        showNotification({
          color: 'red',
          title: 'Delete a lesson failed 😨',
          message: 'Please try again'
        })
      )
  }

  function handleCreateFile(lessonId: number, values: Record<string, unknown>, cancelToken: CancelTokenSource): void {
    axiosInstance
      .post<File>(
        `${api.courses}${courseId}/lessons/${lessonId}/files/`,
        { ...values, cancelToken: cancelToken.token },
        {
          headers: {
            'content-type': 'multipart/form-data'
          }
        }
      )
      .then(({ data }) => {
        setLessons((previousValue) => addFileToLessons(previousValue, lessonId, data))
        showNotification({
          title: 'Create a file success 😁',
          message: 'Yay 😍😍😍'
        })
      })
      .catch(() =>
        showNotification({
          color: 'red',
          title: 'Create a file failed 😨',
          message: 'Please try again'
        })
      )
  }

  function handleEditFile(lessonId: number, fileId: number, values: Record<string, unknown>, cancelToken: CancelTokenSource): void {
    axiosInstance
      .put<File>(
        `${api.courses}${courseId}/lessons/${lessonId}/files/${fileId}/`,
        { ...values, cancelToken: cancelToken.token },
        {
          headers: {
            'content-type': 'multipart/form-data'
          }
        }
      )
      .then(({ data }) => {
        setLessons((previousValue) => {
          const value = deleteLessonFile(previousValue, lessonId, fileId, false)
          return addFileToLessons(value, lessonId, data)
        })
        showNotification({
          title: 'Edit file success 😁',
          message: 'Yay 😍😍😍'
        })
      })
      .catch(() =>
        showNotification({
          color: 'red',
          title: 'Edit file failed 😨',
          message: 'Please try again'
        })
      )
  }

  function handleDeleteFile(lessonId: number, fileId: number, cancelToken: CancelTokenSource): void {
    axiosInstance
      .delete(`${api.courses}${courseId}/lessons/${lessonId}/files/${fileId}/`, { cancelToken: cancelToken.token })
      .then(() => {
        setLessons((previousValue) => deleteLessonFile(previousValue, lessonId, fileId, false))
        showNotification({
          title: 'Delete file success 😁',
          message: 'Yay 😍😍😍'
        })
      })
      .catch(() =>
        showNotification({
          color: 'red',
          title: 'Delete file failed 😨',
          message: 'Please try again'
        })
      )
  }

  function handleCloseCreateLessonForm(): void {
    setCreateLessonOpened(false)
    setCreateLessonSubmitting(false)
    axiosCancelToken.cancel()
  }

  React.useEffect(() => {
    async function getLessons() {
      axiosInstance.get<LessonPayload[]>(`${api.courses}${courseId}/lessons/`).then(({ data }) => {
        const newData: Lesson[] = []

        for (const ls of data) {
          const newLs: Lesson = {
            ...ls,
            locationItems: fromLocationPayloads(ls.file_lesson)
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
      <>
        <div>
          <Title order={2}>All lessons</Title>
          <div className={classes.items}>
            {isInEditingMode && (
              <Tooltip label="Create a lesson">
                <Card className={classes.addLesson} onClick={() => setCreateLessonOpened(true)}>
                  <Center>
                    <FiPlus />
                  </Center>
                </Card>
              </Tooltip>
            )}
            {lessons.map((lesson) => (
              <LessonItem
                editLesson={handleEditLesson}
                deleteLesson={handleDeleteLesson}
                createFile={handleCreateFile}
                editFile={handleEditFile}
                deleteFile={handleDeleteFile}
                key={lesson.id}
                lesson={lesson}
              />
            ))}
          </div>
        </div>
        <Modal title="Create a new lesson" centered opened={isCreateLessonOpened} onClose={handleCloseCreateLessonForm}>
          <form className={classes.form} onSubmit={handleCreateLesson}>
            <TextInput required label="Lesson name" {...createLessonForm.getInputProps('name')} />
            <TextInput label="Lesson description" {...createLessonForm.getInputProps('description')} />
            <div className={classes.formButton}>
              <Button variant="outline" color="red" onClick={handleCloseCreateLessonForm}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
          <LoadingOverlay visible={isCreateLessonSubmitting} />
        </Modal>
      </>
    )
  }

  return <Center>This course has no lesson (￣ε(#￣)</Center>
}

export default CourseLessons
