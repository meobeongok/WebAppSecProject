import * as React from 'react'
import { Dropzone, type DropzoneStatus, type DropzoneProps } from '@mantine/dropzone'
import { FiImage, FiUpload, FiX } from 'react-icons/fi'
import { createStyles, Text } from '@mantine/core'
import type { IconBaseProps } from 'react-icons/lib'

interface FileInputIconProps extends IconBaseProps {
  status: DropzoneStatus
}

function FileInputIcon({ status, ...props }: FileInputIconProps): JSX.Element {
  if (status.accepted) return <FiUpload {...props} />
  if (status.rejected) return <FiX {...props} />
  return <FiImage {...props} />
}

interface FileInputContentProps {
  status: DropzoneStatus
  file?: File
}

const useFileInputContent = createStyles({
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem'
  }
})

function FileInputContent({ status, file }: FileInputContentProps): JSX.Element {
  const { classes } = useFileInputContent()

  return (
    <div className={classes.container}>
      <FileInputIcon size={24} status={status} />
      {file ? <Text>{file.name}</Text> : 'Click or drop your image here'}
    </div>
  )
}

const useFileInputStyles = createStyles({
  label: {
    fontSize: 14
  },

  dropzone: {
    borderStyle: 'solid',
    borderWidth: 1
  }
})

type FileInputProps = Omit<DropzoneProps, 'children'> & {
  label?: string
}

function FileInput({ onDrop, label, ...props }: FileInputProps): JSX.Element {
  const { classes } = useFileInputStyles()

  const [file, setFile] = React.useState<File>()

  function handleDrop(files: File[]): void {
    setFile(files[0])
    onDrop(files)
  }

  return (
    <div>
      {label && <label className={classes.label}>{label}</label>}
      <Dropzone multiple={false} onDrop={handleDrop} {...props}>
        {(status) => <FileInputContent status={status} file={file} />}
      </Dropzone>
    </div>
  )
}

export default FileInput
