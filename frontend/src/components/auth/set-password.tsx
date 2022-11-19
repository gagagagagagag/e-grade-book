import { useState } from 'react'
import { Stack, Button, Title, Text, PasswordInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'

import { validatePassword } from '../../utils/custom-validators'
import backendAxios from '../../axios-instance'
import { ErrorAlert, SuccessAlert } from '../ui/alerts'

interface SetPasswordFormResult {
  password: string
}

export const SetPassword = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const isResetPassword = location.pathname === '/resetPassword'

  const setPasswordHandler = async ({ password }: SetPasswordFormResult) => {
    setLoading(true)

    try {
      if (isResetPassword) {
        await backendAxios.post('/auth/resetPassword', {
          token: searchParams.get('token'),
          password,
        })
      } else {
        await backendAxios.post('/auth/initiatePassword', {
          token: searchParams.get('token'),
          password,
        })
      }

      setSuccess(true)
    } finally {
      setLoading(false)
    }
  }

  let content = (
    <SetPasswordForm loading={loading} onSubmit={setPasswordHandler} />
  )
  if (!searchParams.has('token')) {
    content = (
      <ErrorAlert
        message={
          'Link w który kliknąłeś zawiera błąd, spróbuj wygenerować go ponownie lub skontaktuj się z nami'
        }
        buttonText={'Wygeneruj nowy link'}
        onClick={() => navigate('/forgotPassword')}
      />
    )
  } else if (success) {
    content = (
      <SuccessAlert
        message={'Nowe hasło zostało ustawione, mozesz się teraz zalogować!'}
        buttonText={'Przejdź do logowania'}
        onClick={() => navigate('/')}
      />
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
      {content}
    </>
  )
}

const SetPasswordForm = ({
  loading,
  onSubmit,
}: {
  loading: boolean
  onSubmit: (data: SetPasswordFormResult) => Promise<void>
}) => {
  const form = useForm({
    initialValues: {
      password: '',
    },
    validate: {
      password: validatePassword,
    },
  })

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
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
