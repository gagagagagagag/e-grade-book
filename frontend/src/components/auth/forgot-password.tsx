import { Title, Text, Stack, TextInput, Button } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useNavigate } from 'react-router-dom'

export const ForgotPassword = () => {
  return (
    <>
      <Title order={2} align={'center'}>
        Zapomiałem hasła 👋🏻
      </Title>
      <Text weight={400} mt={'md'} mb={'md'}>
        Podaj swój adres email, na który dostaniesz linka to zresetowania hasła
      </Text>
      <ForgotPasswordForm />
    </>
  )
}

const ForgotPasswordForm = () => {
  const navigate = useNavigate()
  const form = useForm({
    initialValues: {
      email: '',
    },
  })

  return (
    <form onSubmit={form.onSubmit(async (values) => {})}>
      <Stack spacing={'sm'}>
        <TextInput
          label={'Email'}
          variant={'filled'}
          {...form.getInputProps('email')}
        />
      </Stack>
      <Stack mt={'sm'} spacing={'sm'}>
        <Button type={'submit'} mt={'xl'} variant={'filled'} fullWidth>
          Potwierdź
        </Button>
        <Button onClick={() => navigate('/')} variant={'subtle'} fullWidth>
          Anuluj
        </Button>
      </Stack>
    </form>
  )
}
