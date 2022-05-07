import * as React from 'react'
import { useAxiosInstance, usePageTitle } from '@/hooks'
import { useForm } from '@mantine/form'
import { Logo } from '@/components'
import { FiAtSign, FiLock } from 'react-icons/fi'
import { Button, createStyles, Paper, PasswordInput, TextInput, Title } from '@mantine/core'
import { api } from '@/constants'
import { useTokenStore } from '@/stores'
import { useLocation, useNavigate } from 'react-router-dom'
import type { TokenPayload } from '@/types'

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
    fontWeight: 400,
    fontSize: theme.fontSizes.md
  }
}))

function Login(): JSX.Element {
  usePageTitle('Sign in')

  const navigate = useNavigate()
  const location = useLocation()

  const axiosInstance = useAxiosInstance()
  const setAccessToken = useTokenStore((state) => state.setAccessToken)

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

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()

    const { hasErrors } = form.validate()
    if (hasErrors) return

    const data = await axiosInstance.post<TokenPayload>(api.signIn, form.values).then(({ data }) => data)

    setAccessToken(data.access)

    if (location.state && Object.keys(location.state as { from: string }).find((key) => key === 'from')) {
      const { from } = location.state as { from: string }
      navigate(from, { replace: true })
    } else {
      navigate('/', { replace: true })
    }
  }

  return (
    <>
      <div>
        <div className={classes.container}>
          <div className={classes.header}>
            <Logo className={classes.logo} />
            <Title className={classes.title}>Sign in to Alunno 😍</Title>
          </div>
          <Paper className={classes.loginContainer} shadow="sm">
            <form onSubmit={handleSubmit} className={classes.form}>
              <TextInput
                required
                autoComplete="email"
                label="Email"
                id="email"
                icon={<FiAtSign />}
                placeholder="Your email"
                {...form.getInputProps('email')}
              />
              <PasswordInput
                required
                autoComplete="current-password"
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
