import * as React from 'react'
import { FileInput, Logo } from '@/components'
import { useAxiosInstance, usePageTitle } from '@/hooks'
import { useNavigate } from 'react-router-dom'
import { Button, createStyles, keyframes, Paper, PasswordInput, Select, TextInput, Title } from '@mantine/core'
import { IMAGE_MIME_TYPE } from '@mantine/dropzone'
import { FiAtSign, FiFlag, FiInfo, FiLock, FiUser } from 'react-icons/fi'
import { useForm } from '@mantine/form'
import { api } from '@/constants'

const rainbowBackgroundHueRotate = keyframes({
  '0%': {
    filter: 'none'
  },

  '50%': {
    filter: 'hue-rotate(180deg)'
  },

  to: {
    filter: 'none'
  }
})

const scrollGradient = keyframes({
  from: {
    backgroundPosition: '50% 0'
  },

  '50%': {
    backgroundPosition: '50% 100%'
  },

  to: {
    backgroundPosition: '50% 0'
  }
})

const useStyles = createStyles((theme) => ({
  container: {
    display: 'grid',
    gridTemplateRows: '1fr 1fr',
    minWidth: '100%',
    maxWidth: '100vw',
    minHeight: '100vh',
    gridAutoRows: 'dense',
    gap: '3rem',

    [`@media (min-width: ${theme.breakpoints.md}px)`]: {
      gridTemplateRows: 'none',
      gridTemplateColumns: '1fr 1fr'
    }
  },

  formContainer: {
    padding: '0 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '1.5rem'
  },

  paper: {
    width: '100%',
    maxWidth: '40rem',
    padding: '1rem 2rem',
    borderRadius: theme.radius.md
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },

  button: {
    marginTop: '0.75rem',
    fontWeight: 400
  },

  // https://github.com/files-community/Website

  gradient: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    zIndex: -1,
    background: `800% 800% linear-gradient( to bottom right, hsl(133, 67%, 59%), hsl(172, 100%, 42%), hsl(202, 97%, 45%), white)`,
    mask: 'url("/mask.png") bottom / cover no-repeat',
    animation: `${rainbowBackgroundHueRotate} 15s infinite linear, ${scrollGradient} 15s infinite linear`,

    [`@media (min-width: ${theme.breakpoints.md}px)`]: {
      transform: 'rotate(0)',
      left: '-40rem'
    }
  },

  info: {
    gridRow: 1,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.5rem',

    [`@media (min-width: ${theme.breakpoints.md}px)`]: {
      gridColumn: 2
    }
  },

  logo: {
    width: '10rem'
  },

  title: {
    textAlign: 'center'
  },

  image: {}
}))

const genders = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'none', label: 'Prefer not to say' }
]

function SignUp(): JSX.Element {
  usePageTitle('Sign up')

  const { classes } = useStyles()
  const navigate = useNavigate()
  const axiosInstance = useAxiosInstance()

  const form = useForm<{
    code: string
    name: string
    email: string
    password: string
    confirmPassword: string
    gender: string
    image?: File
  }>({
    initialValues: {
      code: '',
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      gender: '',
      image: undefined
    },

    validate: {
      code: (value) => (value.length <= 20 ? undefined : 'Code length must be lower than 20'),
      name: (value) => (value.length <= 200 ? undefined : 'Name length must be lower than 200'),
      email: (value) => {
        if (!/^\S+@\S+$/i.test(value)) return 'Invalid email'
        if (value.length > 255) return 'Email length must be lower than 255'
      },
      password: (value) => (value.length >= 8 ? undefined : 'Password too short'),
      confirmPassword: (value, values) => (value === values.password ? undefined : 'Password did not match')
    }
  })

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()

    const { hasErrors } = form.validate()
    if (hasErrors) return

    axiosInstance
      .post(api.signUp, form.values, {
        headers: {
          'content-type': 'multipart/form-data'
        }
      })
      .then(() => navigate('/signin'))
      .catch((err) => {
        if (err.response) {
          const errors: Record<string, string> = {}

          const data = err.response.data as Record<string, string[]>

          if (data.code && data.code[0] === 'member with this code already exists.') {
            errors.code = 'Duplicate code, please use another code'
          }

          if (data.email && data.email[0] === 'This field must be unique.') {
            errors.email = 'Duplicate email, please use another email'
          }

          if (data.image && data.image[0] === 'The submitted data was not a file. Check the encoding type on the form') {
            errors.image = 'Invalid image, please use another image'
          }

          form.setErrors(errors)
        }
      })
  }

  return (
    <div className={classes.container}>
      <div className={classes.formContainer}>
        <Title>Setting up an Alunno account</Title>
        <Paper className={classes.paper}>
          <form className={classes.form} onSubmit={handleSubmit}>
            <TextInput required label="Code" id="code" icon={<FiInfo />} placeholder="Your code" {...form.getInputProps('code')} />
            <TextInput
              required
              autoComplete="email"
              label="Email"
              id="email"
              icon={<FiAtSign />}
              placeholder="Your email"
              {...form.getInputProps('email')}
            />
            <TextInput required label="Name" id="name" icon={<FiUser />} placeholder="Your name" {...form.getInputProps('name')} />
            <Select required label="Gender" placeholder="Your gender" icon={<FiFlag />} data={genders} {...form.getInputProps('gender')} />
            <PasswordInput
              required
              autoComplete="new-password"
              label="Password"
              id="password"
              placeholder="Your password"
              icon={<FiLock />}
              toggleTabIndex={0}
              {...form.getInputProps('password')}
            />
            <PasswordInput
              required
              autoComplete="new-password"
              label="Confirm password"
              id="confirmPassword"
              placeholder="Your confirm password"
              icon={<FiLock />}
              toggleTabIndex={0}
              {...form.getInputProps('confirmPassword')}
            />
            <FileInput
              label="Avatar"
              onDrop={(files) => {
                form.setFieldValue('image', files[0])
              }}
              accept={IMAGE_MIME_TYPE}
            />
            <Button className={classes.button} type="submit">
              Sign up 🙃
            </Button>
          </form>
        </Paper>
      </div>
      <div className={classes.info}>
        <div className={classes.gradient} />
        <Logo className={classes.logo} />
        <Title order={2} className={classes.title}>
          Join our amazing world 😍😍😍
        </Title>
      </div>
    </div>
  )
}

export default SignUp
