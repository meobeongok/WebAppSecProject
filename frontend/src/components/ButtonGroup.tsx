import * as React from 'react'
import { createStyles } from '@mantine/core'
import classnames from 'clsx'

const useStyles = createStyles((theme) => ({
  main: {
    display: 'flex',
    alignItems: 'center',

    '& .group-button .mantine-ActionIcon-root': {
      borderRadius: theme.radius.sm
    },

    '& .group-button:not(:first-of-type) .mantine-ActionIcon-root': {
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0
    },

    '& .group-button:not(:last-of-type) .mantine-ActionIcon-root': {
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0
    }
  }
}))

interface ButtonGroupProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
}

function ButtonGroup({ className, children, ...props }: ButtonGroupProps): JSX.Element {
  const { classes } = useStyles()

  return (
    <span className={classnames(classes.main, className)} {...props}>
      {children}
    </span>
  )
}

export default ButtonGroup
