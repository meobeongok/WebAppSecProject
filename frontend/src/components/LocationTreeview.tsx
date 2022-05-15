import * as React from 'react'
import type { LocationItem } from '@/types'
import { Anchor, createStyles, Text, ThemeIcon } from '@mantine/core'
import { FiChevronDown, FiChevronRight } from 'react-icons/fi'
import { ReactComponent as DocumentIcon } from '@/icons/document.svg'
import { ReactComponent as FileIcon } from '@/icons/file.svg'
import { ReactComponent as FolderIcon } from '@/icons/folder.svg'
import { ReactComponent as PdfIcon } from '@/icons/pdf.svg'

const useLocationTreeviewStyles = createStyles(() => ({
  container: {
    display: 'flex',
    alignItems: 'start',
    gap: '0.5rem',
    flexDirection: 'column'
  }
}))

interface LocationTreeViewProps {
  items: LocationItem[]
}

function LocationTreeView({ items }: LocationTreeViewProps): JSX.Element {
  const { classes } = useLocationTreeviewStyles()

  return (
    <div className={classes.container}>
      {items.map((item) => (
        <LocationTreeItem key={item.id} item={item} />
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
    alignItems: 'center'
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
    display: 'flex',
    flexGrow: 1,
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer'
  },

  anchor: {
    width: '100%',
    textAlign: 'left'
  },

  children: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'stretch',
    paddingLeft: '0.25rem',
    gap: '0.5rem'
  }
}))

interface LocationTreeItemProps {
  item: LocationItem
}

function LocationTreeItem({ item: { name, type, children, fileUrl } }: LocationTreeItemProps): JSX.Element {
  const { classes } = useLocationTreeItemStyles()
  const [isOpen, setOpen] = React.useState<boolean>(false)

  return (
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
              <Anchor href={fileUrl} target="_blank" className={classes.anchor}>
                {name}
              </Anchor>
            )}
          </div>
        </div>
      </div>

      {children && isOpen && (
        <div className={classes.children}>
          {children.map((child) => (
            <LocationTreeItem key={child.fileUrl} item={child} />
          ))}
        </div>
      )}
    </div>
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
