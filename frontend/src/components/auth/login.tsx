import {
  Title,
  Text,
  TextInput,
  Button,
  Stack,
  PasswordInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useNavigate } from 'react-router-dom'

import { validateEmail, validateRequired } from '../../utils/custom-validators'

export const Login = () => {
  return (
    <>
      <Title order={1} size={'h3'} align={'center'}>
        Witaj 👋🏻
      </Title>
      <Text weight={400} mt={'md'} mb={'md'}>
        Zaloguj się do swojego konta
      </Text>
      <LoginForm />
    </>
  )
}

const LoginForm = () => {
  const navigate = useNavigate()
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
    <form onSubmit={form.onSubmit(async (values) => {})}>
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
        <Button type={'submit'} mt={'xl'} variant={'filled'} fullWidth>
          Zaloguj się
        </Button>
        <Button
          onClick={() => navigate('/forgotPassword')}
          variant={'subtle'}
          fullWidth
        >
          Zapomniałem hasła
        </Button>
      </Stack>
    </form>
  )
}
