import * as React from 'react'
import { useParams } from 'react-router-dom'
import { useAxiosInstance } from '@/hooks'
import type { Deadline, File, Lesson, LessonPayload, DeadlinePayload, DeadlineSubmitPayload } from '@/types'
import { api } from '@/constants'
import { Button, Card, Center, createStyles, Loader, LoadingOverlay, Modal, TextInput, Title, Tooltip } from '@mantine/core'
import { LessonItem } from '@/components'
import { fromLocationPayloads } from '@/helpers/location'
import { useEdit } from '@/contexts'
import { FiPlus } from 'react-icons/fi'
import axios, { type CancelTokenSource } from 'axios'
import { useForm } from '@mantine/form'
import { showNotification } from '@mantine/notifications'
import {
  addDeadlineToLessons,
  addFileToLessons,
  addFileToLessonsDeadline,
  deleteLessonFile,
  deleteLessonsDeadline,
  deleteLessonsDeadlineFile,
  editLessonsDeadline
} from '@/helpers'
import { useDisclosure } from '@mantine/hooks'
import { useUserStore } from '@/stores'

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
  const [isFormSubmitting, setFormSubmitting] = React.useState<boolean>(false)
  const user = useUserStore((state) => state.user)

  const [isCreateLessonOpened, createLessonHandler] = useDisclosure(false, {
    onClose: () => {
      axiosCancelToken.cancel()
      setFormSubmitting(false)
    }
  })

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

    setFormSubmitting(true)

    axiosInstance
      .post<Lesson>(`${api.courses}${courseId}/lessons/`, { ...createLessonForm.values, cancelToken: axiosCancelToken })
      .then(({ data }) => {
        setLessons((previousValue) => {
          const newLessons = [...previousValue]
          newLessons.push(data)
          return newLessons
        })

        showNotification({
          title: 'Create a new lesson successfully 😆',
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

    createLessonHandler.close()
  }

  function handleEditLesson(lessonId: number, cancelToken: CancelTokenSource, values: Record<string, string>): void {
    axiosInstance
      .put<LessonPayload>(`${api.courses}${courseId}/lessons/${lessonId}/`, { ...values, cancelToken: cancelToken.token })
      .then(({ data }) => {
        setLessons((previousValue) => {
          const newLessons = previousValue.map((lesson) => {
            if (lesson.id !== data.id) return lesson

            const newDeadlines: Deadline[] = data.deadline_lesson.map((dl) => ({
              ...dl,
              locationItems: fromLocationPayloads(dl.file_deadline_lesson)
            }))

            return {
              ...data,
              deadline_lesson: newDeadlines,
              locationItems: fromLocationPayloads(data.file_lesson)
            }
          })

          return newLessons
        })

        showNotification({
          title: 'Edit a lesson successfully 😆',
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

  async function handleDeleteLesson(lessonId: number) {
    axiosInstance
      .delete(`${api.courses}${courseId}/lessons/${lessonId}/`)
      .then(() => {
        setLessons((previousValue) => {
          const newLessons = previousValue.filter((lesson) => lesson.id !== lessonId)
          return newLessons
        })

        showNotification({
          title: 'Delete a lesson successfully 😆',
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
          title: 'Create a file successfully 😁',
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
          title: 'Edit file successfully 😁',
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

  function handleDeleteFile(lessonId: number, fileId: number): void {
    axiosInstance
      .delete(`${api.courses}${courseId}/lessons/${lessonId}/files/${fileId}/`)
      .then(() => {
        setLessons((previousValue) => deleteLessonFile(previousValue, lessonId, fileId, false))
        showNotification({
          title: 'Delete file successfully 😁',
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

  function handleCreateDeadline(lessonId: number, values: Record<string, string>, cancelToken: CancelTokenSource): void {
    axiosInstance
      .post<DeadlinePayload>(`/deadlineAPI/${lessonId}/lecturerDeadlines/`, {
        ...values,
        cancelToken: cancelToken.token
      })
      .then(({ data }) => {
        setLessons((previousValue) =>
          addDeadlineToLessons(previousValue, lessonId, {
            ...data,
            locationItems: fromLocationPayloads(data.file_deadline_lesson)
          })
        )
        showNotification({
          title: 'Create a deadline successfully 😁',
          message: 'Yay 😍😍😍'
        })
      })
      .catch(() => {
        showNotification({
          color: 'red',
          title: 'Create a deadline failed 😨',
          message: 'Please try again'
        })
      })
  }

  function handleEditDeadline(lessonId: number, deadlineId: number, values: Record<string, string>, cancelToken: CancelTokenSource): void {
    axiosInstance
      .put<DeadlinePayload>(`/deadlineAPI/${lessonId}/lecturerDeadlines/${deadlineId}/`, {
        ...values,
        cancelToken: cancelToken.token
      })
      .then(({ data }) => {
        setLessons((previousValue) =>
          editLessonsDeadline(previousValue, lessonId, deadlineId, {
            ...data,
            locationItems: fromLocationPayloads(data.file_deadline_lesson)
          })
        )
        showNotification({
          title: 'Edit a deadline successfully 😁',
          message: 'Yay 😍😍😍'
        })
      })
      .catch(() => {
        showNotification({
          color: 'red',
          title: 'Edit a deadline failed 😨',
          message: 'Please try again'
        })
      })
  }

  function handleDeleteDeadline(lessonId: number, deadlineId: number): void {
    axiosInstance
      .delete(`/deadlineAPI/${lessonId}/lecturerDeadlines/${deadlineId}/`)
      .then(() => {
        setLessons((previousValue) => deleteLessonsDeadline(previousValue, lessonId, deadlineId))
        showNotification({
          title: 'Delete a deadline successfully 😁',
          message: 'Yay 😍😍😍'
        })
      })
      .catch(() =>
        showNotification({
          color: 'red',
          title: 'Delete a deadline failed 😨',
          message: 'Please try again'
        })
      )
  }

  function handleCreateDeadlineFile(lessonId: number, deadlineId: number, values: Record<string, unknown>, cancelToken: CancelTokenSource) {
    axiosInstance
      .post<File>(
        `/deadlineAPI/${lessonId}/lecturerDeadlines/${deadlineId}/files/`,
        {
          ...values,
          cancelToken: cancelToken.token
        },
        {
          headers: {
            'content-type': 'multipart/form-data'
          }
        }
      )
      .then(({ data }) => {
        setLessons((previousValue) => addFileToLessonsDeadline(previousValue, lessonId, deadlineId, data, true))
        showNotification({
          title: 'Create a deadline file successfully 😁',
          message: 'Yay 😍😍😍'
        })
      })
      .catch(() => {
        showNotification({
          color: 'red',
          title: 'Create a deadline file failed 😨',
          message: 'Please try again'
        })
      })
  }

  function handleEditDeadlineFile(
    lessonId: number,
    deadlineId: number,
    fileId: number,
    values: Record<string, unknown>,
    cancelToken: CancelTokenSource
  ) {
    axiosInstance
      .put<File>(
        `/deadlineAPI/${lessonId}/lecturerDeadlines/${deadlineId}/files/${fileId}/`,
        {
          ...values,
          cancelToken: cancelToken.token
        },
        {
          headers: {
            'content-type': 'multipart/form-data'
          }
        }
      )
      .then(({ data }) => {
        setLessons((previousValue) =>
          addFileToLessonsDeadline(deleteLessonsDeadlineFile(previousValue, lessonId, deadlineId, fileId, true), lessonId, deadlineId, data, true)
        )
        showNotification({
          title: 'Edit a deadline file successfully 😁',
          message: 'Yay 😍😍😍'
        })
      })
      .catch(() => {
        showNotification({
          color: 'red',
          title: 'Edit a deadline file failed 😨',
          message: 'Please try again'
        })
      })
  }

  function handleDeleteDeadlineFile(lessonId: number, deadlineId: number, fileId: number): void {
    axiosInstance
      .delete(`/deadlineAPI/${lessonId}/lecturerDeadlines/${deadlineId}/files/${fileId}/`)
      .then(() => {
        setLessons((previousValue) => deleteLessonsDeadlineFile(previousValue, lessonId, deadlineId, fileId, false))
        showNotification({
          title: 'Delete a deadline file successfully 😁',
          message: 'Yay 😍😍😍'
        })
      })
      .catch(() =>
        showNotification({
          color: 'red',
          title: 'Delete a deadline file failed 😨',
          message: 'Please try again'
        })
      )
  }

  React.useEffect(() => {
    async function getLessons() {
      if (!user) return

      const data = await axiosInstance.get<LessonPayload[]>(`${api.courses}${courseId}/lessons/`).then(({ data }) => data)

      let newData: Lesson[]

      if (user.is_lecturer) {
        newData = data.map((ls) => {
          const newDeadlines: Deadline[] = ls.deadline_lesson.map((dl) => ({
            ...dl,
            locationItems: fromLocationPayloads(dl.file_deadline_lesson)
          }))

          return {
            ...ls,
            deadline_lesson: newDeadlines,
            locationItems: fromLocationPayloads(ls.file_lesson)
          }
        })
      } else {
        const arr: Promise<DeadlineSubmitPayload[]>[] = []
        for (const lesson of data) {
          const promise = axiosInstance.get<DeadlineSubmitPayload[]>(`/deadlineAPI/${lesson.id}/studentDeadlines/`).then(({ data }) => data)
          arr.push(promise)
        }
        const deadlineSubmits = await Promise.all(arr)

        newData = data.map((ls, index) => {
          const newDeadlines: Deadline[] = ls.deadline_lesson.map((dl) => {
            const submit = deadlineSubmits[index].find((submit) => submit.deadline.id === dl.id)

            return {
              ...dl,
              submit_id: submit?.id,
              is_finished: submit?.is_finished,
              locationItems: fromLocationPayloads(dl.file_deadline_lesson)
            }
          })

          return {
            ...ls,
            deadline_lesson: newDeadlines,
            locationItems: fromLocationPayloads(ls.file_lesson)
          }
        })
      }

      setLessons(newData)
      setLoading(false)
    }

    getLessons()
  }, [user])

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
                <Card className={classes.addLesson} onClick={createLessonHandler.open}>
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
                createDeadline={handleCreateDeadline}
                editDeadline={handleEditDeadline}
                deleteDeadline={handleDeleteDeadline}
                createDeadlineFile={handleCreateDeadlineFile}
                editDeadlineFile={handleEditDeadlineFile}
                deleteDeadlineFile={handleDeleteDeadlineFile}
                key={lesson.id}
                lesson={lesson}
              />
            ))}
          </div>
        </div>
        <Modal title="Create a new lesson" centered opened={isCreateLessonOpened} onClose={createLessonHandler.close}>
          <form className={classes.form} onSubmit={handleCreateLesson}>
            <TextInput required label="Lesson name" {...createLessonForm.getInputProps('name')} />
            <TextInput label="Lesson description" {...createLessonForm.getInputProps('description')} />
            <div className={classes.formButton}>
              <Button variant="outline" color="red" onClick={createLessonHandler.close}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
          <LoadingOverlay visible={isFormSubmitting} />
        </Modal>
      </>
    )
  }

  return <Center>This course has no lesson (￣ε(#￣)</Center>
}

export default CourseLessons
