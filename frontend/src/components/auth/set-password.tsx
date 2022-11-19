import { useState } from 'react'
import { Stack, Button, Title, Text, PasswordInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { validatePassword } from '../../utils/custom-validators'
import backendAxios from '../../axios-instance'
import { ErrorAlert } from '../ui/alerts'

export const ResetPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const resetPasswordHandler = async (password: string) => {
    await backendAxios
      .post('/auth/resetPassword', {
        token: searchParams.get('token'),
        password,
      })
      .then(
        () => navigate('/'),
        () => null
      )
  }

  return (
    <>
      <Title order={1} size={'h3'} align={'center'}>
        Witaj 👋🏻
      </Title>
      <Text weight={400} mt={'md'} mb={'md'}>
        Wpisz nowe hasło do swojego konta
      </Text>
      {!searchParams.has('token') ? (
        <ErrorAlert
          message={
            'Link w który kliknąłeś zawiera błąd, spróbuj wygenerować go ponownie lub skontaktuj się z nami'
          }
          buttonText={'Wygeneruj nowy link'}
          onClick={() => navigate('/forgotPassword')}
        />
      ) : (
        <SetPasswordForm onSubmit={resetPasswordHandler} />
      )}
    </>
  )
}

export const InitiatePassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const initiatePasswordHandler = async (password: string) => {
    await backendAxios
      .post('/auth/initiatePassword', {
        token: searchParams.get('token'),
        password,
      })
      .then(
        () => navigate('/'),
        () => null
      )
  }

  return (
    <>
      <Title order={1} size={'h3'} align={'center'}>
        Witaj 👋🏻
      </Title>
      <Text weight={400} mt={'md'} mb={'md'}>
        Stwórz hasło do swojego konta
      </Text>
      {!searchParams.has('token') ? (
        <ErrorAlert
          message={
            'Link w który kliknąłeś zawiera błąd, spróbuj wygenerować go ponownie lub skontaktuj się z nami'
          }
          buttonText={'Wygeneruj nowy link'}
          onClick={() => navigate('/forgotPassword')}
        />
      ) : (
        <SetPasswordForm onSubmit={initiatePasswordHandler} />
      )}
    </>
  )
}

const SetPasswordForm = ({
  onSubmit,
}: {
  onSubmit: (password: string) => Promise<void>
}) => {
  const [loading, setLoading] = useState(false)
  const form = useForm({
    initialValues: {
      password: '',
    },
    validate: {
      password: validatePassword,
    },
  })

  return (
    <form
      onSubmit={form.onSubmit(async (values) => {
        setLoading(true)

        await onSubmit(values.password)

        setLoading(false)
      })}
    >
      <Stack spacing={'sm'}>
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
          Potwierdź
        </Button>
      </Stack>
    </form>
  )
}
