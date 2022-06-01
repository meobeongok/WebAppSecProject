import * as React from 'react'
import type { LocationItem } from '@/types'
import { ActionIcon, Anchor, Button, createStyles, LoadingOverlay, Modal, Text, TextInput, ThemeIcon, Tooltip } from '@mantine/core'
import { FiChevronDown, FiChevronRight, FiEdit, FiX } from 'react-icons/fi'
import { ReactComponent as DocumentIcon } from '@/icons/document.svg'
import { ReactComponent as FileIcon } from '@/icons/file.svg'
import { ReactComponent as FolderIcon } from '@/icons/folder.svg'
import { ReactComponent as PdfIcon } from '@/icons/pdf.svg'
import ButtonGroup from './ButtonGroup'
import classnames from 'clsx'
import { useEdit } from '@/contexts'
import { useDisclosure } from '@mantine/hooks'
import axios, { type CancelTokenSource } from 'axios'
import { useForm } from '@mantine/form'
import FileInput from './FileInput'
import { showNotification } from '@mantine/notifications'
import { useTokenStore } from '@/stores'

const useLocationTreeviewStyles = createStyles((theme) => ({
  container: {
    display: 'flex',
    alignItems: 'start',
    gap: '0.5rem',
    flexDirection: 'column'
  },

  item: {
    ':hover': {
      backgroundColor: theme.colorScheme === 'light' ? '#00000010' : 'ffffff10'
    }
  }
}))

interface LocationTreeViewProps {
  items: LocationItem[]
  type: 'lesson' | 'deadline' | 'none'
  editFile?: (fileId: number, values: Record<string, unknown>, cancelToken: CancelTokenSource) => void
  deleteFile?: (fileId: number) => void
  editDeadlineFile?: (fileId: number, values: Record<string, unknown>, cancelToken: CancelTokenSource) => void
  deleteDeadlineFile?: (fileId: number) => void
}

function LocationTreeView({ items, type = 'none', editFile, deleteFile, editDeadlineFile, deleteDeadlineFile }: LocationTreeViewProps): JSX.Element {
  const { classes } = useLocationTreeviewStyles()

  return (
    <div className={classes.container}>
      {items.map((item) => (
        <LocationTreeItem
          deleteFile={deleteFile}
          editFile={editFile}
          editDeadlineFile={editDeadlineFile}
          deleteDeadlineFile={deleteDeadlineFile}
          type={type}
          key={item.id}
          item={item}
        />
      ))}
    </div>
  )
}

const useLocationTreeItemStyles = createStyles((theme) => ({
  wrapper: {
    width: '100%'
  },

  container: {
    display: 'grid',
    gridTemplateColumns: '1rem auto',
    gap: '0.5rem',
    alignItems: 'center',
    borderRadius: theme.radius.md,

    ':hover': {
      backgroundColor: theme.colorScheme === 'light' ? '#00000010' : '#ffffff10'
    }
  },

  nameWrapper: {
    gridColumn: 2,
    display: 'flex',
    alignItems: 'center',
    padding: '0.25rem',
    gap: '0.5rem',
    borderRadius: theme.radius.sm
  },

  name: {
    position: 'relative',
    display: 'flex',
    flexGrow: 1,
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',

    '&:hover .group-hover': {
      visibility: 'visible'
    }
  },

  anchor: {
    width: '100%',
    textAlign: 'left'
  },

  children: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'stretch',
    paddingLeft: '0.5rem',
    gap: '0.5rem'
  },

  chevron: {
    paddingLeft: '0.5rem'
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

interface LocationTreeItemProps {
  item: LocationItem
  type: 'lesson' | 'deadline' | 'none'
  editFile?: (fileId: number, values: Record<string, unknown>, cancelToken: CancelTokenSource) => void
  deleteFile?: (fileId: number) => void
  editDeadlineFile?: (fileId: number, values: Record<string, unknown>, cancelToken: CancelTokenSource) => void
  deleteDeadlineFile?: (fileId: number) => void
}

function LocationTreeItem({
  item: { id, name, type, children, file_upload: fileUrl, in_folder = '' },
  type: itemType,
  editFile,
  deleteFile,
  editDeadlineFile,
  deleteDeadlineFile
}: LocationTreeItemProps): JSX.Element {
  const { classes } = useLocationTreeItemStyles()
  const [isOpen, setOpen] = React.useState<boolean>(false)
  const { isInEditingMode } = useEdit()
  const accessToken = useTokenStore((state) => state.accessToken)

  const [isFormSubmitting, setFormSubmitting] = React.useState<boolean>(false)

  const editFileCancelToken = axios.CancelToken.source()
  const editDeadlineFileCancelToken = axios.CancelToken.source()

  const [isFileEditOpened, fileEditHandler] = useDisclosure(false, {
    onClose: () => {
      editFileCancelToken.cancel()
      fileEditForm.setValues({
        name,
        in_folder,
        file_upload: undefined
      })
      setFormSubmitting(false)
    }
  })

  const [isDeleteFileOpened, deleteFileHandler] = useDisclosure(false, {
    onClose: () => {
      setFormSubmitting(false)
    }
  })

  const [isFileDeadlineEditOpened, fileDeadlineEditHandler] = useDisclosure(false, {
    onClose: () => {
      editDeadlineFileCancelToken.cancel()
      fileDeadlineEditForm.setValues({
        name,
        in_folder,
        file_upload: undefined
      })
      setFormSubmitting(false)
    }
  })

  const [isDeleteFileDeadlineOpened, deleteFileDeadlineHandler] = useDisclosure(false, {
    onClose: () => {
      setFormSubmitting(false)
    }
  })

  const fileEditForm = useForm<{
    name: string
    in_folder: string
    file_upload?: File
  }>({
    initialValues: {
      name,
      in_folder,
      file_upload: undefined
    },

    validate: {
      name: (value) => (value === '' ? 'Name must not empty' : undefined),
      file_upload: (value) => (value === undefined ? 'File must not empty' : undefined)
    }
  })

  const fileDeadlineEditForm = useForm<{
    name: string
    in_folder: string
    file_upload?: File
  }>({
    initialValues: {
      name,
      in_folder,
      file_upload: undefined
    },

    validate: {
      name: (value) => (value === '' ? 'Name must not empty' : undefined),
      file_upload: (value) => (value === undefined ? 'File must not empty' : undefined)
    }
  })

  function handleEditFile(e: React.FormEvent): void {
    e.preventDefault()

    const { hasErrors } = fileEditForm.validate()
    if (hasErrors) return

    if (editFile) editFile(id, fileEditForm.values, editFileCancelToken)

    fileEditHandler.close()
  }

  function handleDeleteFile(e: React.FormEvent): void {
    e.preventDefault()
    setFormSubmitting(true)

    if (deleteFile) deleteFile(id)

    setFormSubmitting(false)
  }

  function handleEditDeadlineFile(e: React.FormEvent): void {
    e.preventDefault()

    const { hasErrors } = fileDeadlineEditForm.validate()
    if (hasErrors) return

    if (editDeadlineFile) editDeadlineFile(id, fileDeadlineEditForm.values, editDeadlineFileCancelToken)

    fileDeadlineEditHandler.close()
  }

  function handleDeleteDeadlineFile(e: React.FormEvent): void {
    e.preventDefault()
    setFormSubmitting(true)

    if (deleteDeadlineFile) deleteDeadlineFile(id)

    setFormSubmitting(false)
  }

  function handleAnchorClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()

    const url = import.meta.env.VITE_MEDIA_URL + fileUrl

    axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        responseType: 'arraybuffer'
      })
      .then((response) => {
        const blob = new Blob([response.data], { type: response.headers['content-type'] })
        const url = window.URL.createObjectURL(blob)

        window.open(url)
      })
      .catch(() =>
        showNotification({
          color: 'red',
          title: 'Not authorized',
          message: "You don't have permission to view this file"
        })
      )
  }

  return (
    <>
      <div className={classes.wrapper}>
        <div
          className={classes.container}
          onClick={() => {
            isOpen ? setOpen(false) : setOpen(true)
          }}
        >
          {children && (isOpen ? <FiChevronDown /> : <FiChevronRight />)}
          <div className={classes.nameWrapper}>
            <div className={classes.name}>
              <LocationItemIcon type={type} />
              {type === 'folder' ? (
                <Text>{name}</Text>
              ) : (
                <>
                  <Anchor href={import.meta.env.VITE_MEDIA_URL + fileUrl} onClick={handleAnchorClick} className={classes.anchor}>
                    {name}
                  </Anchor>
                  {isInEditingMode && itemType === 'lesson' && (
                    <ButtonGroup className={classnames(classes.buttonGroup, 'group-hover')}>
                      <Tooltip className="group-button" label="Edit file">
                        <ActionIcon onClick={fileEditHandler.open} size="md" color="dark" variant="outline">
                          <FiEdit size="0.75rem" />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip className="group-button" label="Delete file">
                        <ActionIcon onClick={deleteFileHandler.open} size="md" color="red" variant="outline">
                          <FiX size="0.75rem" />
                        </ActionIcon>
                      </Tooltip>
                    </ButtonGroup>
                  )}
                  {isInEditingMode && itemType === 'deadline' && (
                    <ButtonGroup className={classnames(classes.buttonGroup, 'group-hover')}>
                      <Tooltip className="group-button" label="Edit file">
                        <ActionIcon onClick={fileDeadlineEditHandler.open} size="md" color="dark" variant="outline">
                          <FiEdit size="0.75rem" />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip className="group-button" label="Delete file">
                        <ActionIcon onClick={deleteFileDeadlineHandler.open} size="md" color="red" variant="outline">
                          <FiX size="0.75rem" />
                        </ActionIcon>
                      </Tooltip>
                    </ButtonGroup>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {children && isOpen && (
          <div className={classes.children}>
            {children.map((child) => (
              <LocationTreeItem
                editFile={editFile}
                deleteFile={deleteFile}
                editDeadlineFile={editDeadlineFile}
                deleteDeadlineFile={deleteDeadlineFile}
                type={itemType}
                key={child.file_upload}
                item={child}
              />
            ))}
          </div>
        )}
      </div>
      {itemType === 'lesson' && (
        <>
          <Modal title={`Edit lesson file: ${name}`} centered opened={isFileEditOpened} onClose={fileEditHandler.close}>
            <form onSubmit={handleEditFile}>
              <FileInput
                required
                label="File"
                onDrop={(files) => {
                  fileEditForm.setFieldValue('file_upload', files[0])

                  if (fileEditForm.values.name === '') {
                    fileEditForm.setFieldValue('name', files[0].name)
                  }
                }}
                {...fileEditForm.getInputProps('file_upload')}
              />
              <TextInput required label="File name" {...fileEditForm.getInputProps('name')} />
              <TextInput label="In folder" {...fileEditForm.getInputProps('in_folder')} />
              <div className={classes.formButton}>
                <Button variant="outline" color="red" onClick={fileEditHandler.close}>
                  Cancel
                </Button>
                <Button type="submit">Edit</Button>
              </div>
            </form>
            <LoadingOverlay visible={isFormSubmitting} />
          </Modal>
          <Modal centered title={`Delete file: ${name}`} opened={isDeleteFileOpened} onClose={deleteFileHandler.close}>
            <form onSubmit={handleDeleteFile}>
              <div className={classes.formButton}>
                <Button variant="outline" onClick={deleteFileHandler.close}>
                  Cancel
                </Button>
                <Button color="red" type="submit">
                  Delete
                </Button>
              </div>
            </form>
            <LoadingOverlay visible={isFormSubmitting} />
          </Modal>
        </>
      )}
      {itemType === 'deadline' && (
        <>
          <Modal title={`Edit deadline file: ${name}`} centered opened={isFileDeadlineEditOpened} onClose={fileDeadlineEditHandler.close}>
            <form onSubmit={handleEditDeadlineFile}>
              <FileInput
                required
                label="File"
                onDrop={(files) => {
                  fileDeadlineEditForm.setFieldValue('file_upload', files[0])

                  if (fileDeadlineEditForm.values.name === '') {
                    fileDeadlineEditForm.setFieldValue('name', files[0].name)
                  }
                }}
                {...fileDeadlineEditForm.getInputProps('file_upload')}
              />
              <TextInput required label="File name" {...fileDeadlineEditForm.getInputProps('name')} />
              <TextInput label="In folder" {...fileDeadlineEditForm.getInputProps('in_folder')} />
              <div className={classes.formButton}>
                <Button variant="outline" color="red" onClick={fileDeadlineEditHandler.close}>
                  Cancel
                </Button>
                <Button type="submit">Edit</Button>
              </div>
            </form>
            <LoadingOverlay visible={isFormSubmitting} />
          </Modal>
          <Modal centered title={`Delete deadline file: ${name}`} opened={isDeleteFileDeadlineOpened} onClose={deleteFileDeadlineHandler.close}>
            <form onSubmit={handleDeleteDeadlineFile}>
              <div className={classes.formButton}>
                <Button variant="outline" onClick={deleteFileDeadlineHandler.close}>
                  Cancel
                </Button>
                <Button color="red" type="submit">
                  Delete
                </Button>
              </div>
            </form>
            <LoadingOverlay visible={isFormSubmitting} />
          </Modal>
        </>
      )}
    </>
  )
}

interface LocationItemIconProps {
  type: string
}

function LocationItemIcon({ type }: LocationItemIconProps): JSX.Element {
  function SelectIcon(): React.FunctionComponent<React.SVGProps<SVGSVGElement>> {
    switch (type) {
      case 'folder':
        return FolderIcon
      case '.pdf':
        return PdfIcon
      case '.doc':
      case '.docx':
      case '.txt':
        return DocumentIcon
      default:
        return FileIcon
    }
  }

  const Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>> = SelectIcon()

  return (
    <ThemeIcon size="sm" variant="outline" style={{ border: 0 }}>
      <Icon />
    </ThemeIcon>
  )
}

export default LocationTreeView
