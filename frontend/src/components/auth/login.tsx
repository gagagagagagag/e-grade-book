import {
  Title,
  Text,
  TextInput,
  Button,
  Stack,
  PasswordInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import backendAxios from '../../axios-instance'
import {
  useAppDispatch,
  loginSuccess,
  useAppSelector,
  sessionClearTimeout,
} from '../../store'
import { validateEmail, validateRequired } from '../../utils/custom-validators'
import { InfoAlert } from '../ui/alerts'
import { AuthTokens, AuthCredentials } from './types'

export const Login = () => {
  const sessionLogout = useAppSelector((state) => state.session.endedByTimeout)
  const [loading, setLoading] = useState(false)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const loginHandler = async (data: AuthCredentials) => {
    setLoading(true)

    try {
      const response = await backendAxios.post<AuthTokens>('/auth/login', data)

      dispatch(loginSuccess(response.data))
    } finally {
      setLoading(false)
    }
  }

  if (sessionLogout) {
    return (
      <InfoAlert
        message={'Zostałeś wylogowany z powodu zakończenia sesji'}
        buttonText={'Zaloguj ponownie'}
        onClick={() => dispatch(sessionClearTimeout())}
      />
    )
  }

  return (
    <>
      <Title order={1} size={'h3'} align={'center'}>
        Witaj 👋🏻
      </Title>
      <Text weight={400} mt={'md'} mb={'md'}>
        Zaloguj się do swojego konta
      </Text>
      <LoginForm
        loading={loading}
        onSubmit={loginHandler}
        onForgot={() => navigate('/forgotPassword')}
      />
    </>
  )
}

const LoginForm = ({
  loading,
  onSubmit,
  onForgot,
}: {
  loading: boolean
  onSubmit: (data: AuthCredentials) => Promise<void>
  onForgot: () => void
}) => {
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: validateEmail,
      password: validateRequired,
    },
  })

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack spacing={'sm'}>
        <TextInput
          label={'Email'}
          type={'email'}
          variant={'filled'}
          {...form.getInputProps('email')}
        />
        <PasswordInput
          label={'Hasło'}
          variant={'filled'}
          {...form.getInputProps('password')}
        />
      </Stack>
      <Stack mt={'sm'} spacing={'sm'}>
        <Button
          type={'submit'}
          mt={'xl'}
          variant={'filled'}
          loading={loading}
          fullWidth
        >
          Zaloguj się
        </Button>
        <Button
          onClick={onForgot}
          variant={'subtle'}
          disabled={loading}
          fullWidth
        >
          Zapomniałem hasła
        </Button>
      </Stack>
    </form>
  )
}
