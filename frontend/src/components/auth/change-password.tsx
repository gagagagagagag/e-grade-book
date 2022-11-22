import { useState } from 'react'
import { Button, Group, Modal, PasswordInput, Stack } from '@mantine/core'
import { useForm } from '@mantine/form'

import {
  validatePassword,
  validateRequired,
} from '../../utils/custom-validators'
import backendAxios from '../../axios-instance'
import { showSuccessNotification } from '../../utils/custom-notifications'

type ChangePasswordFormResult = {
  oldPassword: string
  newPassword: string
}

export const ChangePasswordModal = ({
  opened,
  onClose,
}: {
  opened: boolean
  onClose: () => void
}) => {
  const [loading, setLoading] = useState(false)

  const changePasswordHandler = async ({
    oldPassword,
    newPassword,
  }: ChangePasswordFormResult) => {
    setLoading(true)

    try {
      await backendAxios.patch('/auth/changePassword', {
        oldPassword,
        newPassword,
      })

      showSuccessNotification('Hasło zostało zmienione!')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Modal title={'Zmiana hasła'} opened={opened} onClose={onClose}>
        <ChangePasswordForm
          loading={loading}
          onSubmit={changePasswordHandler}
        />
      </Modal>
    </>
  )
}

export const ChangePasswordForm = ({
  loading,
  onSubmit,
}: {
  loading: boolean
  onSubmit: (data: ChangePasswordFormResult) => void
}) => {
  const form = useForm({
    initialValues: {
      oldPassword: '',
      newPassword: '',
    },
    validate: {
      oldPassword: validateRequired,
      newPassword: validatePassword,
    },
  })

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack spacing={'md'}>
        <PasswordInput
          autoComplete={'current-password'}
          label={'Poprzednie hasło'}
          variant={'filled'}
          {...form.getInputProps('oldPassword')}
        />
        <PasswordInput
          autoComplete={'new-password'}
          label={'Nowe hasło'}
          variant={'filled'}
          {...form.getInputProps('newPassword')}
        />
      </Stack>
      <Group mt={'lg'} position={'right'} spacing={'md'}>
        <Button type={'submit'} loading={loading}>
          Zapisz
        </Button>
      </Group>
    </form>
  )
}
