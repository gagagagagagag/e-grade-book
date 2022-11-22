import { Button, Modal } from '@mantine/core'
import { IconPlus } from '@tabler/icons'
import { useState } from 'react'

import { showSuccessNotification } from '../../../utils/custom-notifications'
import { useUserCreate, useUserUpdate } from '../hooks'
import { User } from '../types'
import { UserForm, UserFormResult } from './user-form'

export const CreateUserButton = ({ onCreated }: { onCreated: () => void }) => {
  const [opened, setOpened] = useState(false)

  return (
    <>
      <Button leftIcon={<IconPlus size={16} />} onClick={() => setOpened(true)}>
        Stwórz
      </Button>
      <CreateUserModal
        opened={opened}
        onClose={(createdUser) => {
          setOpened(false)
          if (createdUser) {
            onCreated()
          }
        }}
      />
    </>
  )
}

export const CreateUserModal = ({
  opened,
  onClose,
}: {
  opened: boolean
  onClose: (createdUser?: User) => void
}) => {
  const [loading, setLoading] = useState(false)
  const createUser = useUserCreate()

  const createUserHandler = async (data: UserFormResult) => {
    setLoading(true)

    try {
      const shouldCreatePassword =
        !Boolean(data.sendEmail) &&
        Boolean(data.createPassword) &&
        data.password

      const createdUser = await createUser({
        name: data.name,
        email: data.email,
        role: data.role,
        sendEmail: Boolean(data.sendEmail),
        password: shouldCreatePassword ? data.password : undefined,
      })

      showSuccessNotification('Użytkownik został stworzony!')
      onClose(createdUser)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title={'Stwórz użytkownika'} opened={opened} onClose={onClose}>
      <UserForm
        loading={loading}
        isEditing={false}
        onSubmit={createUserHandler}
      />
    </Modal>
  )
}

export const EditUserModal = ({
  user,
  opened,
  onClose,
}: {
  user: User
  opened: boolean
  onClose: (updatedUser?: User) => void
}) => {
  const [loading, setLoading] = useState(false)
  const updateUser = useUserUpdate()

  const updateUserHandler = async (data: UserFormResult) => {
    setLoading(false)

    try {
      const updatedUser = await updateUser(user._id, {
        name: data.name,
        email: data.email,
      })

      showSuccessNotification('Użytkownik został zmieniony!')
      onClose(updatedUser)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title={'Edytuj użytkownika'} opened={opened} onClose={onClose}>
      <UserForm
        initialValues={{
          email: user.email,
          name: user.name,
          role: user.role,
        }}
        loading={loading}
        onSubmit={updateUserHandler}
        isEditing
      />
    </Modal>
  )
}
