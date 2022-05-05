import * as React from 'react'
import { useForm } from '@mantine/form'
import { Logo, Metadata } from '@/components'
import { FiAtSign, FiLock } from 'react-icons/fi'
import { Button, createStyles, Paper, PasswordInput, TextInput, Title } from '@mantine/core'
import type { NextPage } from '@/types/next'

const useStyles = createStyles((theme) => ({
  container: {
    minWidth: '100%',
    maxWidth: '100vw',
    minHeight: '100vh',
    padding: '3rem 1rem'
  },

  header: {
    padding: '1.5rem 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    alignItems: 'center'
  },

  title: {
    textAlign: 'center'
  },

  logo: {
    width: '10rem'
  },

  loginContainer: {
    minWidth: '10rem',
    maxWidth: '40rem',
    padding: '1rem 1.5rem 1.5rem',
    borderRadius: theme.radius.md,
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '2rem'
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },

  signInButton: {
    marginTop: '0.75rem',
    fontSize: theme.fontSizes.md
  }
}))

const Login: NextPage = () => {
  const { classes } = useStyles()

  const form = useForm({
    initialValues: {
      email: '',
      password: ''
    },

    validate: {
      email: (value) => (/^\S+@\S+$/i.test(value) ? undefined : 'Invalid email')
    }
  })

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault()

    const { hasErrors } = form.validate()
    if (hasErrors) return
  }

  return (
    <>
      <Metadata title="Login - Alunno" description="Alunno's login page" />
      <div>
        <div className={classes.container}>
          <div className={classes.header}>
            <Logo className={classes.logo} />
            <Title className={classes.title}>Sign in to Alunno 😍</Title>
          </div>
          <Paper className={classes.loginContainer} shadow="sm">
            <form onSubmit={handleSubmit} className={classes.form}>
              <TextInput required label="Email" id="email" icon={<FiAtSign />} placeholder="Your email" {...form.getInputProps('email')} />
              <PasswordInput
                required
                label="Password"
                id="password"
                placeholder="Your password"
                icon={<FiLock />}
                toggleTabIndex={0}
                {...form.getInputProps('password')}
              />
              <Button className={classes.signInButton} type="submit">
                Sign in
              </Button>
            </form>
          </Paper>
        </div>
      </div>
    </>
  )
}

export default Login
