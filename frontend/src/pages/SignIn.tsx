import * as React from 'react'
import { useAxiosInstance, usePageTitle } from '@/hooks'
import { useForm } from '@mantine/form'
import { Logo } from '@/components'
import { FiAlertTriangle, FiAtSign, FiLock } from 'react-icons/fi'
import { Alert, Anchor, Button, createStyles, LoadingOverlay, Paper, PasswordInput, TextInput, Title } from '@mantine/core'
import { api } from '@/constants'
import { useTokenStore } from '@/stores'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { TokenPayload } from '@/types'
import type { AxiosError } from 'axios'

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
    marginLeft: 'auto',
    marginRight: 'auto',
    display: 'flex',
    flexDirection: 'column'
  },

  paper: {
    padding: '1rem 1.5rem 1.5rem',
    borderRadius: theme.radius.md,
    marginTop: '1.5rem'
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
  },

  signUp: {
    textAlign: 'center'
  }
}))

function Login(): JSX.Element {
  usePageTitle('Sign in')

  const navigate = useNavigate()
  const location = useLocation()

  const accessToken = useTokenStore((state) => state.accessToken)
  const setAccessToken = useTokenStore((state) => state.setAccessToken)

  const axiosInstance = useAxiosInstance()

  const [isAuthComplete, setAuthComplete] = React.useState<boolean>(false)
  const [isLoading, setLoading] = React.useState<boolean>(false)
  const [currentStatus, setCurrentStatus] = React.useState<{
    title: string
    description: string
    color: string
  }>()

  const { classes } = useStyles()

  const form = useForm({
    initialValues: {
      email: '',
      password: ''
    },

    validate: {
      email: (value) => {
        if (!/^\S+@\S+$/i.test(value)) return 'Invalid email'
        if (value.length > 255) return 'Email length must be lower than 255'
      },
      password: (value) => (value.length >= 8 ? undefined : 'Password too short')
    }
  })

  function handleCloseAlert(): void {
    setCurrentStatus(undefined)
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()

    setLoading(true)

    const { hasErrors } = form.validate()
    if (hasErrors) {
      setLoading(false)
      return
    }

    axiosInstance
      .post<TokenPayload>(api.signIn, form.values)
      .then(({ data }) => {
        setCurrentStatus({ title: 'Signed in', description: 'Please wait... 😘', color: 'blue' })
        setTimeout(() => setAccessToken(data.access), 500)
      })
      .catch((error: AxiosError) => {
        if (error.response && error.response.status === 401) {
          setCurrentStatus({ title: 'Invalid email or password', description: 'Please try another password', color: 'red' })
        }

        setTimeout(() => setLoading(false), 500)
      })
  }

  React.useEffect(() => {
    async function getTokens(): Promise<void> {
      try {
        if (accessToken) {
          setTimeout(() => setAuthComplete(true), 500)
          navigate('/', { replace: true })
          return
        }

        const data = await axiosInstance.post<TokenPayload>(api.refresh).then(({ data }) => data)
        setAccessToken(data.access)

        setTimeout(() => setAuthComplete(true), 500)
      } catch {
        setTimeout(() => setAuthComplete(true), 500)
      }
    }

    getTokens()
  }, [])

  React.useEffect(() => {
    if (!accessToken) return

    if (location.state && Object.keys(location.state as { from: string }).find((key) => key === 'from')) {
      const { from } = location.state as { from: string }
      navigate(from, { replace: true })
    } else {
      navigate('/', { replace: true })
    }
  }, [accessToken])

  if (!isAuthComplete) return <LoadingOverlay visible />

  return (
    <>
      <div>
        <div className={classes.container}>
          <div className={classes.header}>
            <Logo className={classes.logo} />
            <Title className={classes.title}>Sign in to Alunno 😍</Title>
          </div>
          <div className={classes.loginContainer}>
            {currentStatus && (
              <Alert
                icon={<FiAlertTriangle />}
                color={currentStatus.color}
                title={currentStatus.title}
                withCloseButton
                closeButtonLabel="Close alert"
                onClose={handleCloseAlert}
              >
                {currentStatus.description}
              </Alert>
            )}
            <Paper className={classes.paper} shadow="sm">
              <form onSubmit={handleSubmit} className={classes.form}>
                <TextInput
                  required
                  autoComplete="email"
                  label="Email"
                  id="email"
                  icon={<FiAtSign />}
                  placeholder="Your email"
                  disabled={isLoading}
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
                  disabled={isLoading}
                  {...form.getInputProps('password')}
                />
                <Button className={classes.signInButton} type="submit" loading={isLoading}>
                  Sign in
                </Button>
              </form>
            </Paper>
            <Anchor className={classes.signUp} component={Link} to="/signup">
              Don't have an account? Sign up 😘
            </Anchor>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login
