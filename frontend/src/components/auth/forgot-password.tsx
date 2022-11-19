import { useState } from 'react'
import { Title, Text, Stack, TextInput, Button } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useNavigate } from 'react-router-dom'

import backendAxios from '../../axios-instance'
import { validateEmail } from '../../utils/custom-validators'
import { SuccessAlert } from '../ui/alerts'

export const ForgotPassword = () => {
  const navigate = useNavigate()
  const [success, setSuccess] = useState(false)

  const submitHandler = async (email: string) => {
    await backendAxios
      .post('/auth/sendPasswordLink', {
        email,
      })
      .then(
        () => {
          setSuccess(true)
        },
        () => null
      )
  }

  return (
    <>
      <Title order={1} size={'h3'} align={'center'}>
        Zapomiałem hasła 👋🏻
      </Title>
      <Text weight={400} mt={'md'} mb={'md'}>
        Podaj swój adres email, na który dostaniesz linka to zresetowania hasła
      </Text>
      {success ? (
        <SuccessAlert
          message={'Email z linkiem do zresetowania hasła został wysłany!'}
          buttonText={'Powrót do logowania'}
          onClick={() => navigate('/')}
        />
      ) : (
        <ForgotPasswordForm
          onSubmit={submitHandler}
          onCancel={() => navigate('/')}
        />
      )}
    </>
  )
}

const ForgotPasswordForm = ({
  onSubmit,
  onCancel,
}: {
  onSubmit: (email: string) => Promise<void>
  onCancel: () => void
}) => {
  const [loading, setLoading] = useState(false)
  const form = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: validateEmail,
    },
  })

  return (
    <form
      onSubmit={form.onSubmit(async (values) => {
        setLoading(false)

        await onSubmit(values.email).then(null, () => null)

        setLoading(false)
      })}
    >
      <Stack spacing={'sm'}>
        <TextInput
          label={'Email'}
          type={'email'}
          variant={'filled'}
          {...form.getInputProps('email')}
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
        <Button
          onClick={onCancel}
          variant={'subtle'}
          disabled={loading}
          fullWidth
        >
          Anuluj
        </Button>
      </Stack>
    </form>
  )
}
