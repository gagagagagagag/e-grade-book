import { Stack, Button, Title, Text, Alert, PasswordInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useSearchParams } from 'react-router-dom'
import { IconAlertCircle } from '@tabler/icons'

export const ResetPassword = () => {
  const [searchParams] = useSearchParams()

  return (
    <>
      <Title order={2} align={'center'}>
        Witaj 👋🏻
      </Title>
      <Text weight={400} mt={'md'} mb={'md'}>
        Wpisz nowe hasło do swojego konta
      </Text>
      {!searchParams.has('token') ? <TokenMissingError /> : <SetPasswordForm />}
    </>
  )
}

export const InitiatePassword = () => {
  const [searchParams] = useSearchParams()

  return (
    <>
      <Title order={2} align={'center'}>
        Witaj 👋🏻
      </Title>
      <Text weight={400} mt={'md'} mb={'md'}>
        Stwórz hasło do swojego konta
      </Text>
      {!searchParams.has('token') ? <TokenMissingError /> : <SetPasswordForm />}
    </>
  )
}

const SetPasswordForm = () => {
  const form = useForm({
    initialValues: {
      password: '',
    },
  })

  return (
    <form onSubmit={form.onSubmit(async (values) => {})}>
      <Stack spacing={'sm'}>
        <PasswordInput
          label={'Hasło'}
          variant={'filled'}
          {...form.getInputProps('password')}
        />
      </Stack>
      <Stack mt={'sm'} spacing={'sm'}>
        <Button type={'submit'} mt={'xl'} variant={'filled'} fullWidth>
          Potwierdź
        </Button>
      </Stack>
    </form>
  )
}

const TokenMissingError = () => {
  return (
    <Alert title={'Błąd'} icon={<IconAlertCircle size={16} />} color={'red'}>
      <Stack spacing={'md'}>
        <Text>
          Link w który kliknąłeś zawiera błąd, spróbuj wygenerować go ponownie
          lub skontaktuj się z nami
        </Text>
        <Button variant={'outline'} color={'red'} fullWidth>
          Wygeneruj nowy link
        </Button>
      </Stack>
    </Alert>
  )
}
