import * as React from 'react'
import type { Lesson } from '@/types'
import { Card, Text, createStyles, Divider, ActionIcon, Tooltip, Menu, Modal, TextInput, LoadingOverlay, Button } from '@mantine/core'
import { FiEdit, FiPlus, FiX } from 'react-icons/fi'
import ButtonGroup from './ButtonGroup'
import LocationTreeView from './LocationTreeview'
import { useEdit } from '@/contexts'
import { useForm } from '@mantine/form'
import axios, { type CancelTokenSource } from 'axios'
import { useDisclosure } from '@mantine/hooks'
import FileInput from './FileInput'

interface LessonItemProps {
  lesson: Lesson
  editLesson: (lessonId: number, cancelToken: CancelTokenSource, values: Record<string, string>) => void
  deleteLesson: (lessonId: number, cancelToken: CancelTokenSource) => void
  createFile: (lessonId: number, values: Record<string, unknown>, cancelToken: CancelTokenSource) => void
  editFile: (lessonId: number, fileId: number, values: Record<string, unknown>, cancelToken: CancelTokenSource) => void
  deleteFile: (lessonId: number, fileId: number, cancelToken: CancelTokenSource) => void
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
  title: {
    position: 'relative',
    fontSize: '1.1rem',
    fontWeight: 500,
    color: theme.colors.blue[6]
  },
  files: {
    paddingLeft: '0.5rem'
  },

  header: {
    fontWeight: 600
  },

  buttonGroup: {
    position: 'absolute',
    top: 0,
    right: 0
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

function LessonItem({
  lesson: { name, id, description, locationItems },
  editLesson,
  deleteLesson,
  createFile,
  editFile,
  deleteFile
}: LessonItemProps): JSX.Element {
  const { classes } = useStyles()
  const { isInEditingMode } = useEdit()

  const [isFormLoading, setFormLoading] = React.useState<boolean>(false)

  const [isEditLessonOpened, editLessonHandler] = useDisclosure(false, {
    onClose: () => {
      axiosCancelToken.cancel()
      editLessonForm.setValues({
        name: '',
        description: ''
      })
      setFormLoading(false)
    }
  })

  const [isDeleteLessonOpened, deleteLessonHandler] = useDisclosure(false, {
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

  const editLessonForm = useForm({
    initialValues: {
      name,
      description
    },
    validate: {
      name: (value) => (value === '' ? 'Name must not empty' : undefined)
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

  function handleEditLesson(e: React.FormEvent): void {
    e.preventDefault()

    const { hasErrors } = editLessonForm.validate()
    if (hasErrors) return

    setFormLoading(true)
    editLesson(id, axiosCancelToken, editLessonForm.values)

    editLessonHandler.close()
  }

  function handleDeleteLesson(e: React.FormEvent): void {
    e.preventDefault()

    setFormLoading(true)

    deleteLesson(id, axiosCancelToken)

    deleteLessonHandler.close()
  }

  function handleCreateFile(e: React.FormEvent): void {
    e.preventDefault()

    const { hasErrors } = createFileForm.validate()
    if (hasErrors) return

    setFormLoading(true)

    createFile(id, createFileForm.values, axiosCancelToken)

    createFileHandler.close()
  }

  function handleEditFile(fileId: number, values: Record<string, unknown>, cancelToken: CancelTokenSource): void {
    editFile(id, fileId, values, cancelToken)
  }

  function handleDeleteFile(fileId: number, cancelToken: CancelTokenSource): void {
    deleteFile(id, fileId, cancelToken)
  }

  return (
    <>
      <Card className={classes.container}>
        <Text className={classes.title}>
          {name}
          {isInEditingMode && (
            <ButtonGroup className={classes.buttonGroup}>
              <Menu
                className="group-button"
                control={
                  <Tooltip label="Create new...">
                    <ActionIcon size="md" color="teal" variant="outline">
                      <FiPlus size="0.75rem" />
                    </ActionIcon>
                  </Tooltip>
                }
              >
                <Menu.Item onClick={createFileHandler.open}>File</Menu.Item>
                <Menu.Item>Deadline</Menu.Item>
              </Menu>
              <Tooltip className="group-button" label="Edit lesson">
                <ActionIcon onClick={editLessonHandler.open} size="md" color="dark" variant="outline">
                  <FiEdit size="0.75rem" />
                </ActionIcon>
              </Tooltip>
              <Tooltip className="group-button" label="Delete lesson">
                <ActionIcon onClick={deleteLessonHandler.open} size="md" color="red" variant="outline">
                  <FiX size="0.75rem" />
                </ActionIcon>
              </Tooltip>
            </ButtonGroup>
          )}
        </Text>
        <Text className={classes.description}>{description}</Text>
        {locationItems && locationItems.length > 0 && (
          <>
            <Divider my="sm" />
            <Text className={classes.header}>Lesson material</Text>
            <span className={classes.files}>
              <LocationTreeView editFile={handleEditFile} deleteFile={handleDeleteFile} type="lesson" items={locationItems} />
            </span>
          </>
        )}
      </Card>
      <Modal title={`Edit lesson: ${name}`} centered opened={isEditLessonOpened} onClose={editLessonHandler.close}>
        <form className={classes.form} onSubmit={handleEditLesson}>
          <TextInput required label="Lesson name" {...editLessonForm.getInputProps('name')} />
          <TextInput label="Lesson description" {...editLessonForm.getInputProps('description')} />
          <div className={classes.formButton}>
            <Button variant="outline" color="red" onClick={editLessonHandler.close}>
              Cancel
            </Button>
            <Button type="submit">Edit</Button>
          </div>
        </form>
        <LoadingOverlay visible={isFormLoading} />
      </Modal>
      <Modal centered title={`Delete lesson: ${name}`} opened={isDeleteLessonOpened} onClose={deleteLessonHandler.close}>
        <form onSubmit={handleDeleteLesson}>
          <div className={classes.formButton}>
            <Button variant="outline" onClick={deleteLessonHandler.close}>
              Cancel
            </Button>
            <Button color="red" type="submit">
              Delete
            </Button>
          </div>
        </form>
        <LoadingOverlay visible={isFormLoading} />
      </Modal>
      <Modal centered title={`Add file to lesson: ${name}`} opened={isCreateFileOpened} onClose={createFileHandler.close}>
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

export default LessonItem
