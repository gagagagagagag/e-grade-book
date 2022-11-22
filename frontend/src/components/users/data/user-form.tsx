import {
  Select,
  Stack,
  TextInput,
  Group,
  Button,
  Checkbox,
  PasswordInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'

import {
  validateEmail,
  validatePassword,
  validateRequired,
} from '../../../utils/custom-validators'
import { User, UserRoles } from '../types'

export type UserFormResult = Pick<User, 'name' | 'email' | 'role'> & {
  sendEmail?: boolean
  createPassword?: boolean
  password?: string
}

export type UserFormProps = {
  loading: boolean
  initialValues?: UserFormResult
  onSubmit: (data: UserFormResult) => void
  isEditing: boolean
}

export const UserForm = ({
  loading,
  initialValues = { name: '', email: '', role: UserRoles.Student },
  onSubmit,
  isEditing,
}: UserFormProps) => {
  const form = useForm({
    initialValues: {
      ...initialValues,
      sendEmail: true,
      createPassword: false,
      password: '',
    },
    validate: {
      name: validateRequired,
      email: validateEmail,
      password: (value, { createPassword, sendEmail }) => {
        if (!sendEmail && createPassword) {
          return validatePassword(value)
        }
        return null
      },
    },
  })

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack spacing={'md'}>
        <TextInput
          label={'Imie i nazwisko'}
          variant={'filled'}
          {...form.getInputProps('name')}
        />
        <TextInput
          label={'Email'}
          variant={'filled'}
          {...form.getInputProps('email')}
        />
        <Select
          label={'Rola'}
          variant={'filled'}
          data={[
            { label: 'Uczeń', value: UserRoles.Student },
            { label: 'Rodzic', value: UserRoles.Parent },
            { label: 'Nauczyciel', value: UserRoles.Teacher },
          ]}
          disabled={isEditing}
          {...form.getInputProps('role')}
        />
        {!isEditing && (
          <Checkbox
            label={'Wyślij maila powitalnego z linkiem do stworzenia hasła'}
            {...form.getInputProps('sendEmail', { type: 'checkbox' })}
          />
        )}
        {!form.values.sendEmail && (
          <Checkbox
            label={'Stwórz hasło dla użytkownika'}
            {...form.getInputProps('createPassword', { type: 'checkbox' })}
          />
        )}
        {!form.values.sendEmail && form.values.createPassword && (
          <PasswordInput
            label={'Hasło dla użytkownika'}
            variant={'filled'}
            {...form.getInputProps('password')}
          />
        )}
      </Stack>
      <Group position={'right'} mt={'md'}>
        <Button type={'submit'} loading={loading}>
          Zapisz
        </Button>
      </Group>
    </form>
  )
}
