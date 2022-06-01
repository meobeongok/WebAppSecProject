import { FileInput, LocationTreeview, RemainTime } from '@/components'
import { addSubmitFileDeadline, deleteSubmitFileDeadline, fromLocationPayloads } from '@/helpers'
import { useAxiosInstance } from '@/hooks'
import { useUserStore } from '@/stores'
import type { DeadlineSubmit, DeadlineSubmitPayload, File as DeadlineFile } from '@/types'
import { Center, createStyles, Loader, Title, Text, Card, Divider, Button, Modal, TextInput, LoadingOverlay } from '@mantine/core'
import * as React from 'react'
import { useParams } from 'react-router-dom'
import classnames from 'clsx'
import { showNotification } from '@mantine/notifications'
import type { CancelTokenSource } from 'axios'
import { useDisclosure } from '@mantine/hooks'
import axios from 'axios'
import { useForm } from '@mantine/form'
import { useEdit } from '@/contexts'

const useStyles = createStyles((theme) => ({
  container: {},

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
  },

  card: {
    marginTop: '0.75rem',
    borderRadius: theme.radius.md,
    boxShadow: theme.shadows.xs
  },

  info: {
    display: 'grid',
    gridTemplateRows: '1fr 1fr 1fr auto',
    gridTemplateColumns: 'auto 1fr',
    columnGap: '1.5rem',
    rowGap: '0.5rem',

    '& .submit-child': {
      padding: '0.25rem 1rem 0.25rem 0'
    },

    '& .submit-child:nth-of-type(2n+1)': {
      borderRight: '2px solid',
      borderRightColor: theme.colors.blue[6]
    }
  },

  submitFileContainer: {
    marginTop: '1.5rem',
    borderRadius: theme.radius.md,
    boxShadow: theme.shadows.xs,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },

  headerItem: {
    fontWeight: 600
  },

  submitButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    justifyContent: 'center'
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
    justifyContent: 'end',
    marginTop: '0.5rem'
  }
}))

function SubmitDeadline(): JSX.Element {
  const user = useUserStore((state) => state.user)

  const { classes } = useStyles()
  const [submitDeadline, setSubmitDeadline] = React.useState<DeadlineSubmit>()
  const [isLoading, setLoading] = React.useState<boolean>(true)
  const [isOverDue, setOverDue] = React.useState<boolean>(false)
  const [isFormLoading, setFormLoading] = React.useState<boolean>(false)
  const axiosInstance = useAxiosInstance()
  const { lessonId: lessonIdStr, submitId: submitIdStr } = useParams() as { lessonId: string; submitId: string }
  const lessonId = Number(lessonIdStr)
  const submitId = Number(submitIdStr)

  const { setInEditingMode } = useEdit()

  const [isCreateFileOpened, createFileHandler] = useDisclosure(false, {
    onClose: () => {
      axiosCancelToken.cancel()
      createFileForm.setValues({
        name: '',
        in_folder: '',
        file_upload: undefined
      })
      setFormLoading(false)
    }
  })

  const [isSubmitDeadlineOpened, submitDeadlineHandler] = useDisclosure(false, {
    onClose: () => {
      setFormLoading(false)
    }
  })

  const [isUnsubmitDeadlineOpened, unsubmitDeadlineHandler] = useDisclosure(false, {
    onClose: () => {
      setFormLoading(false)
    }
  })

  const axiosCancelToken = axios.CancelToken.source()

  const createFileForm = useForm<{
    name: string
    in_folder: string
    file_upload?: File
  }>({
    initialValues: {
      name: '',
      in_folder: '',
      file_upload: undefined
    },

    validate: {
      name: (value) => (value === '' ? 'Name must not empty' : undefined),
      file_upload: (value) => (value === undefined ? 'File must not empty' : undefined)
    }
  })

  function handleRemainTimeChange(isDeadlineOverDue: boolean): void {
    setOverDue(isDeadlineOverDue)
  }

  function handleCreateDeadlineFile(e: React.FormEvent) {
    e.preventDefault()

    const { hasErrors } = createFileForm.validate()
    if (hasErrors) return

    setFormLoading(true)

    axiosInstance
      .post<DeadlineFile>(
        `/deadlineAPI/${lessonId}/studentDeadlines/${submitDeadline?.id}/files/`,
        {
          ...createFileForm.values,
          cancelToken: axiosCancelToken.token
        },
        {
          headers: {
            'content-type': 'multipart/form-data'
          }
        }
      )
      .then(({ data }) => {
        setSubmitDeadline((previousValue) => addSubmitFileDeadline(previousValue, data, true))
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

    createFileHandler.close()
  }

  function handleEditDeadlineFile(fileId: number, values: Record<string, unknown>, cancelToken: CancelTokenSource) {
    axiosInstance
      .put<DeadlineFile>(
        `/deadlineAPI/${lessonId}/studentDeadlines/${submitDeadline?.id}/files/${fileId}/`,
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
        setSubmitDeadline((previousValue) => {
          const deletedDeadlineSubmit = deleteSubmitFileDeadline(previousValue, fileId, true)
          return addSubmitFileDeadline(deletedDeadlineSubmit, data, true)
        })
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

  function handleDeleteDeadlineFile(fileId: number) {
    axiosInstance
      .delete(`/deadlineAPI/${lessonId}/studentDeadlines/${submitDeadline?.id}/files/${fileId}/`)
      .then(() => {
        setSubmitDeadline((previousValue) => deleteSubmitFileDeadline(previousValue, fileId, true))
        showNotification({
          title: 'Delete a deadline file successfully 😁',
          message: 'Yay 😍😍😍'
        })
      })
      .catch(() => {
        showNotification({
          color: 'red',
          title: 'Delete a deadline file failed 😨',
          message: 'Please try again'
        })
      })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (submitDeadline?.file_deadlineSubmit_lesson.length === 0) {
      showNotification({
        color: 'red',
        title: 'Empty file 😨',
        message: 'Please add files to submit'
      })
    } else {
      axiosInstance
        .put<DeadlineSubmitPayload>(
          `/deadlineAPI/${lessonId}/studentDeadlines/${submitDeadline?.id}/submit/`,
          {},
          { cancelToken: axiosCancelToken.token }
        )
        .then(({ data }) => {
          const newData = {
            ...data,
            file_deadlineSubmit_lesson: fromLocationPayloads(data.file_deadlineSubmit_lesson),
            deadline: {
              ...data.deadline,
              locationItems: fromLocationPayloads(data.deadline.file_deadline_lesson)
            }
          }

          setSubmitDeadline(newData)

          showNotification({
            title: 'Submitted 🤩',
            message: 'Yay 😍😍😍'
          })
        })
        .catch(() => {
          showNotification({
            color: 'red',
            title: 'Submit failed 😨',
            message: 'Please try again'
          })
        })
    }

    submitDeadlineHandler.close()
  }

  function handleUnsubmit(e: React.FormEvent) {
    e.preventDefault()

    axiosInstance
      .put<DeadlineSubmitPayload>(
        `/deadlineAPI/${lessonId}/studentDeadlines/${submitDeadline?.id}/unsubmit/`,
        {},
        { cancelToken: axiosCancelToken.token }
      )
      .then(({ data }) => {
        const newData = {
          ...data,
          file_deadlineSubmit_lesson: fromLocationPayloads(data.file_deadlineSubmit_lesson),
          deadline: {
            ...data.deadline,
            locationItems: fromLocationPayloads(data.deadline.file_deadline_lesson)
          }
        }

        setSubmitDeadline(newData)

        showNotification({
          title: 'Unsubmitted 🤩',
          message: 'Yay 😍😍😍'
        })
      })
      .catch(() => {
        showNotification({
          color: 'red',
          title: 'Unsubmit failed 😨',
          message: 'Please try again'
        })
      })

    unsubmitDeadlineHandler.close()
  }

  function handleSubmitClose() {
    submitDeadlineHandler.close()
    axiosCancelToken.cancel()
  }

  function handleUnsubmitClose() {
    unsubmitDeadlineHandler.close()
    axiosCancelToken.cancel()
  }

  React.useEffect(() => {
    if (user === undefined || user.is_lecturer) return

    async function getSubmitDeadline() {
      axiosInstance
        .get<DeadlineSubmitPayload>(`/deadlineAPI/${lessonId}/studentDeadlines/${submitId}/`)
        .then(({ data }) => {
          const newData = {
            ...data,
            file_deadlineSubmit_lesson: fromLocationPayloads(data.file_deadlineSubmit_lesson),
            deadline: {
              ...data.deadline,
              locationItems: fromLocationPayloads(data.deadline.file_deadline_lesson)
            }
          }

          setSubmitDeadline(newData)
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
        })
    }

    getSubmitDeadline()
  }, [user])

  React.useEffect(() => {
    if (!submitDeadline) return

    setInEditingMode(!submitDeadline.is_finished)
  }, [submitDeadline])

  if (isLoading) {
    return (
      <Center>
        <Loader />
      </Center>
    )
  }

  if (submitDeadline) {
    return (
      <>
        <div>
          <div className={classes.header}>
            <div className={classes.title}>
              <Title order={2}>{submitDeadline.deadline.name}</Title>
              <Text className={classes.remainTitle}>-</Text>
              <div className={classes.remain}>
                <Text className={classes.remainTitle}>Remain time:</Text>
                <RemainTime
                  className={classes.remainTitle}
                  begin={new Date(submitDeadline.deadline.begin)}
                  end={new Date(submitDeadline.deadline.end)}
                  is_finished={submitDeadline.is_finished}
                  onTimeChange={handleRemainTimeChange}
                />
              </div>
            </div>
            <Text className={classes.description}>{submitDeadline.deadline.description}</Text>
          </div>
          <Card className={classes.card}>
            <div className={classes.info}>
              <Text className={classnames('submit-child', classes.headerItem)}>Is submitted</Text>
              <Text className="submit-child" color={submitDeadline.is_finished ? 'green' : 'red'}>
                {submitDeadline.is_finished ? 'Submitted 😍' : 'Not submitted 😒'}
              </Text>
              <Text className={classnames('submit-child', classes.headerItem)}>Date</Text>
              <Text className="submit-child">{`${new Date(submitDeadline.deadline.begin).toLocaleDateString()} ${new Date(
                submitDeadline.deadline.begin
              ).toLocaleTimeString()} - ${new Date(submitDeadline.deadline.end).toLocaleDateString()} ${new Date(
                submitDeadline.deadline.end
              ).toLocaleTimeString()}`}</Text>
              <Text className={classnames('submit-child', classes.headerItem)}>Finish at</Text>
              <Text className="submit-child">{submitDeadline.finish_at ?? 'None'}</Text>
            </div>
          </Card>
          <Card className={classes.submitFileContainer}>
            <Text className={classes.headerItem}>Uploaded files</Text>
            <Divider mx="md" my="sm" />
            {submitDeadline.file_deadlineSubmit_lesson.length > 0 ? (
              <LocationTreeview
                items={submitDeadline.file_deadlineSubmit_lesson}
                type="deadline"
                editDeadlineFile={handleEditDeadlineFile}
                deleteDeadlineFile={handleDeleteDeadlineFile}
              />
            ) : (
              <Text align="center">{isOverDue ? '￣へ￣ Go away, you lazy ~~~' : '＞︿＜ Please submit your files'}</Text>
            )}
            {!isOverDue && (
              <>
                <Divider mx="md" my="sm" />
                <div className={classes.submitButtons}>
                  {!submitDeadline.is_finished && (
                    <Button variant="outline" onClick={createFileHandler.open}>
                      Add file
                    </Button>
                  )}
                  {submitDeadline.is_finished ? (
                    <Button color="red" onClick={unsubmitDeadlineHandler.open}>
                      Unsubmit
                    </Button>
                  ) : (
                    <Button onClick={submitDeadlineHandler.open}>Submit</Button>
                  )}
                </div>
              </>
            )}
          </Card>
        </div>
        <Modal centered title={`Add file to deadline: ${submitDeadline.deadline.name}`} opened={isCreateFileOpened} onClose={createFileHandler.close}>
          <form className={classes.form} onSubmit={handleCreateDeadlineFile}>
            <FileInput
              required
              label="File"
              onDrop={(files) => {
                createFileForm.setFieldValue('file_upload', files[0])

                if (createFileForm.values.name === '') {
                  createFileForm.setFieldValue('name', files[0].name)
                }
              }}
              {...createFileForm.getInputProps('file_upload')}
            />
            <TextInput required label="File name" {...createFileForm.getInputProps('name')} />
            <TextInput label="In folder" {...createFileForm.getInputProps('in_folder')} />
            <div className={classes.formButton}>
              <Button variant="outline" color="red" onClick={createFileHandler.close}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
          <LoadingOverlay visible={isFormLoading} />
        </Modal>
        <Modal centered title={`Submit deadline: ${submitDeadline.deadline.name}`} opened={isSubmitDeadlineOpened} onClose={handleSubmitClose}>
          <form onSubmit={handleSubmit}>
            <div className={classes.formButton}>
              <Button color="red" variant="outline" onClick={handleSubmitClose}>
                Cancel
              </Button>
              <Button type="submit">Submit</Button>
            </div>
          </form>
          <LoadingOverlay visible={isFormLoading} />
        </Modal>
        <Modal centered title={`Unsubmit deadline: ${submitDeadline.deadline.name}`} opened={isUnsubmitDeadlineOpened} onClose={handleUnsubmitClose}>
          <form onSubmit={handleUnsubmit}>
            <div className={classes.formButton}>
              <Button variant="outline" onClick={handleUnsubmitClose}>
                Cancel
              </Button>
              <Button color="red" type="submit">
                Unsubmit
              </Button>
            </div>
          </form>
          <LoadingOverlay visible={isFormLoading} />
        </Modal>
      </>
    )
  }

  if (user && user.is_lecturer) return <Center>You are not a student (￣ε(#￣)</Center>

  return <Center>This deadline is not exist (￣ε(#￣)</Center>
}

export default SubmitDeadline
