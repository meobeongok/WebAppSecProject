import * as React from 'react'
import { useEdit } from '@/contexts'
import { useUserStore } from '@/stores'
import type { Deadline } from '@/types/deadline'
import { Anchor, Text, createStyles, Tooltip, ActionIcon, Modal, TextInput, Indicator, Button, LoadingOverlay } from '@mantine/core'
import { FiCalendar, FiClock, FiEdit, FiPlus, FiX } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import ButtonGroup from './ButtonGroup'
import RemainTime from './RemainTime'
import classnames from 'clsx'
import { DatePicker, TimeInput } from '@mantine/dates'
import dayjs from 'dayjs'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import axios, { type CancelTokenSource } from 'axios'
import FileInput from './FileInput'
import LocationTreeView from './LocationTreeview'

interface DeadlineItemProps {
  deadline: Deadline
  editDeadline: (deadlineId: number, values: Record<string, string>, cancelToken: CancelTokenSource) => void
  deleteDeadline: (deadlineId: number, cancelToken: CancelTokenSource) => void
  createFile: (deadlineId: number, values: Record<string, unknown>, cancelToken: CancelTokenSource) => void
  editFile: (deadlineId: number, fileId: number, values: Record<string, unknown>, cancelToken: CancelTokenSource) => void
  deleteFile: (deadlineId: number, fileId: number, cancelToken: CancelTokenSource) => void
}

const useStyles = createStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    position: 'relative',
    padding: '0.25rem',
    borderRadius: theme.radius.md,

    '&:hover .group-hover': {
      visibility: 'visible'
    },

    ':hover': {
      backgroundColor: theme.colorScheme === 'light' ? '#00000010' : 'ffffff10'
    }
  },

  description: {
    paddingLeft: '0.75rem'
  },

  buttonGroup: {
    position: 'absolute',
    top: 0,
    right: 0,
    visibility: 'hidden'
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

function DeadlineItem({
  deadline: { id, name, description, lesson, begin, end, locationItems, submit_id, is_finished },
  editDeadline,
  deleteDeadline,
  createFile,
  editFile,
  deleteFile
}: DeadlineItemProps): JSX.Element {
  const { classes } = useStyles()
  const user = useUserStore((state) => state.user)
  const { isInEditingMode } = useEdit()
  const [isFormLoading, setFormLoading] = React.useState<boolean>(false)

  const [isEditDeadlineOpened, editDeadlineHandler] = useDisclosure(false, {
    onOpen: () => {
      editDeadlineForm.setValues({
        name,
        description,
        startDate: new Date(begin),
        startTime: new Date(begin),
        endDate: new Date(end),
        endTime: new Date(end)
      })
    },
    onClose: () => {
      axiosCancelToken.cancel()
      setFormLoading(false)
    }
  })

  const [isDeleteDeadlineOpened, deleteDeadlineHandler] = useDisclosure(false, {
    onClose: () => {
      axiosCancelToken.cancel()
      setFormLoading(false)
    }
  })

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

  const editDeadlineForm = useForm<{
    name: string
    description: string
    startDate: Date
    startTime: Date
    endDate: Date
    endTime: Date
  }>({
    initialValues: {
      name,
      description,
      startDate: new Date(begin),
      startTime: new Date(begin),
      endDate: new Date(end),
      endTime: new Date(end)
    },
    validate: {
      startDate: (value, values) => {
        if (dayjs(value).format('MM:DD:YYYY') > dayjs(values.endDate).format('MM:DD:YYYY')) {
          return 'Start date must be sooner than end date'
        }
        return undefined
      },
      startTime: (value, values) => {
        if (dayjs(values.startDate).format('MM:DD:YYYY') !== dayjs(values.endDate).format('MM:DD:YYYY')) {
          return undefined
        }

        if (dayjs(value).format('hh:mm') >= dayjs(values.endTime).format('hh:mm')) {
          return 'Start time must be sooner than end time'
        }

        return undefined
      },
      endDate: (value) => {
        if (new Date(dayjs(value).format('MM:DD:YYYY')) < new Date(dayjs(new Date()).format('MM:DD:YYYY'))) {
          return 'End date must be later than current date'
        }
        return undefined
      },
      endTime: (value, values) => {
        const currentTime = new Date()
        if (dayjs(values.endDate).format('MM:DD:YYYY') !== dayjs(currentTime).format('MM:DD:YYYY')) {
          return undefined
        }

        if (dayjs(value).format('hh:mm') <= dayjs(currentTime).format('hh:mm')) {
          return 'Start time must be later than current time'
        }
      }
    }
  })

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

  const axiosCancelToken = axios.CancelToken.source()

  function handleEditDeadline(e: React.FormEvent) {
    e.preventDefault()

    const { hasErrors } = editDeadlineForm.validate()
    if (hasErrors) return

    setFormLoading(true)

    const values = editDeadlineForm.values
    editDeadline(
      id,
      {
        name: values.name,
        description: values.description,
        begin: dayjs(values.startDate).hour(values.startTime.getHours()).minute(values.startTime.getMinutes()).toISOString(),
        end: dayjs(values.endDate).hour(values.endTime.getHours()).minute(values.endTime.getMinutes()).toISOString()
      },
      axiosCancelToken
    )

    editDeadlineHandler.close()
  }

  function handleDeleteDeadline(e: React.FormEvent) {
    e.preventDefault()

    setFormLoading(true)

    deleteDeadline(id, axiosCancelToken)

    setFormLoading(false)
  }

  function handleCreateFile(e: React.FormEvent) {
    e.preventDefault()

    const { hasErrors } = createFileForm.validate()
    if (hasErrors) return

    createFile(id, createFileForm.values, axiosCancelToken)

    createFileHandler.close()
  }

  function handleEditFile(fileId: number, values: Record<string, unknown>, cancelToken: CancelTokenSource) {
    editFile(id, fileId, values, cancelToken)
  }

  function handleDeleteDeadlineFile(fileId: number, cancelToken: CancelTokenSource) {
    deleteFile(id, fileId, cancelToken)
  }

  if (user?.is_lecturer) {
    return (
      <>
        <div className={classes.container}>
          <div className={classes.header}>
            <Anchor component={Link} to={`lessons/${lesson}/deadlines/${id}`}>
              {name}
            </Anchor>
            <Text>-</Text>
            <Text>{`${new Date(begin).toLocaleDateString()} ${new Date(begin).toLocaleTimeString()} - ${new Date(
              end
            ).toLocaleDateString()} ${new Date(end).toLocaleTimeString()}`}</Text>
            {isInEditingMode && (
              <ButtonGroup className={classnames(classes.buttonGroup, 'group-hover')}>
                <Tooltip className="group-button" label="Add deadline file">
                  <ActionIcon onClick={createFileHandler.open} size="md" color="cyan" variant="outline">
                    <FiPlus size="0.75rem" />
                  </ActionIcon>
                </Tooltip>
                <Tooltip className="group-button" label="Edit deadline">
                  <ActionIcon onClick={editDeadlineHandler.open} size="md" color="dark" variant="outline">
                    <FiEdit size="0.75rem" />
                  </ActionIcon>
                </Tooltip>
                <Tooltip className="group-button" label="Delete deadline">
                  <ActionIcon onClick={deleteDeadlineHandler.open} size="md" color="red" variant="outline">
                    <FiX size="0.75rem" />
                  </ActionIcon>
                </Tooltip>
              </ButtonGroup>
            )}
          </div>
          {description && <Text className={classes.description}>{description}</Text>}
          {locationItems && locationItems.length > 0 && (
            <LocationTreeView items={locationItems} editDeadlineFile={handleEditFile} deleteDeadlineFile={handleDeleteDeadlineFile} type="deadline" />
          )}
        </div>
        <Modal title="Edit a deadline" centered opened={isEditDeadlineOpened} onClose={editDeadlineHandler.close}>
          <form className={classes.form} onSubmit={handleEditDeadline}>
            <TextInput required label="Name" {...editDeadlineForm.getInputProps('name')} />
            <TextInput label="Description" {...editDeadlineForm.getInputProps('description')} />
            <DatePicker
              required
              icon={<FiCalendar />}
              label="Start date"
              renderDay={(date) => {
                const currentDate = new Date()

                return (
                  <Indicator
                    disabled={
                      date.getDate() !== currentDate.getDate() ||
                      date.getMonth() !== currentDate.getMonth() ||
                      date.getFullYear() !== currentDate.getFullYear()
                    }
                  >
                    {date.getDate()}
                  </Indicator>
                )
              }}
              {...editDeadlineForm.getInputProps('startDate')}
            />
            <TimeInput required icon={<FiClock />} label="Start time" {...editDeadlineForm.getInputProps('startTime')} />
            <DatePicker
              required
              icon={<FiCalendar />}
              label="End date"
              renderDay={(date) => {
                const currentDate = new Date()

                return (
                  <Indicator
                    disabled={
                      date.getDate() !== currentDate.getDate() ||
                      date.getMonth() !== currentDate.getMonth() ||
                      date.getFullYear() !== currentDate.getFullYear()
                    }
                  >
                    {date.getDate()}
                  </Indicator>
                )
              }}
              {...editDeadlineForm.getInputProps('endDate')}
            />
            <TimeInput icon={<FiClock />} required label="End time" {...editDeadlineForm.getInputProps('endTime')} />
            <div className={classes.formButton}>
              <Button color="red" variant="outline" onClick={editDeadlineHandler.close}>
                Cancel
              </Button>
              <Button type="submit">Edit</Button>
            </div>
          </form>
          <LoadingOverlay visible={isFormLoading} />
        </Modal>
        <Modal centered title={`Delete lesson: ${name}`} opened={isDeleteDeadlineOpened} onClose={deleteDeadlineHandler.close}>
          <form onSubmit={handleDeleteDeadline}>
            <div className={classes.formButton}>
              <Button variant="outline" onClick={deleteDeadlineHandler.close}>
                Cancel
              </Button>
              <Button color="red" type="submit">
                Delete
              </Button>
            </div>
          </form>
          <LoadingOverlay visible={isFormLoading} />
        </Modal>
        <Modal centered title={`Add file to deadline: ${name}`} opened={isCreateFileOpened} onClose={createFileHandler.close}>
          <form className={classes.form} onSubmit={handleCreateFile}>
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
      </>
    )
  }
  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <Anchor component={Link} to={`lessons/${lesson}/submitdeadline/${submit_id}`}>
          {name}
        </Anchor>
        <Text>-</Text>
        <RemainTime begin={new Date(begin)} end={new Date(end)} is_finished={is_finished} />
      </div>
      {description && <Text className={classes.description}>{description}</Text>}
      {locationItems && locationItems.length > 0 && <LocationTreeView items={locationItems} type="none" />}
    </div>
  )
}

export default DeadlineItem
