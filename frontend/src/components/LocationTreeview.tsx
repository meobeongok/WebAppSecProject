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
  type: 'lesson' | 'deadline'
  editFile: (fileId: number, values: Record<string, unknown>, cancelToken: CancelTokenSource) => void
  deleteFile: (fileId: number, cancelToken: CancelTokenSource) => void
}

function LocationTreeView({ items, type, editFile, deleteFile }: LocationTreeViewProps): JSX.Element {
  const { classes } = useLocationTreeviewStyles()

  return (
    <div className={classes.container}>
      {items.map((item) => (
        <LocationTreeItem deleteFile={deleteFile} editFile={editFile} type={type} key={item.id} item={item} />
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
  type: 'lesson' | 'deadline'
  editFile: (fileId: number, values: Record<string, unknown>, cancelToken: CancelTokenSource) => void
  deleteFile: (fileId: number, cancelToken: CancelTokenSource) => void
}

function LocationTreeItem({
  item: { id, name, type, children, file_url: fileUrl },
  type: itemType,
  editFile,
  deleteFile
}: LocationTreeItemProps): JSX.Element {
  const { classes } = useLocationTreeItemStyles()
  const [isOpen, setOpen] = React.useState<boolean>(false)
  const { isInEditingMode } = useEdit()

  const [isFormSubmitting, setFormSubmitting] = React.useState<boolean>(false)

  const [isFileEditOpened, fileEditHandler] = useDisclosure(false, {
    onClose: () => {
      axiosCancelToken.cancel()
      fileEditForm.setValues({
        name: '',
        in_folder: '',
        file_upload: undefined
      })
      setFormSubmitting(false)
    }
  })

  const [isDeleteFileOpened, deleteFileHandler] = useDisclosure(false, {
    onClose: () => {
      axiosCancelToken.cancel()
      setFormSubmitting(false)
    }
  })

  const fileEditForm = useForm<{
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

  function handleEditFile(e: React.FormEvent): void {
    e.preventDefault()

    const { hasErrors } = fileEditForm.validate()
    if (hasErrors) return

    editFile(id, fileEditForm.values, axiosCancelToken)

    fileEditHandler.close()
  }

  function handleDeleteFile(e: React.FormEvent): void {
    e.preventDefault()
    setFormSubmitting(true)

    deleteFile(id, axiosCancelToken)

    setFormSubmitting(false)
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
                  <Anchor href={fileUrl} target="_blank" className={classes.anchor}>
                    {name}
                  </Anchor>
                  {isInEditingMode && (
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
                </>
              )}
            </div>
          </div>
        </div>

        {children && isOpen && (
          <div className={classes.children}>
            {children.map((child) => (
              <LocationTreeItem editFile={editFile} deleteFile={deleteFile} type={itemType} key={child.file_url} item={child} />
            ))}
          </div>
        )}
      </div>
      {itemType === 'lesson' && (
        <>
          <Modal title="Edit lesson file" centered opened={isFileEditOpened} onClose={fileEditHandler.close}>
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
