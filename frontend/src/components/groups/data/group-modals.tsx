import { useState } from 'react'
import { Button, Modal } from '@mantine/core'
import { IconPlus } from '@tabler/icons'

import { Group } from '../types'
import { useGroupCreate } from '../hooks'
import { GroupForm, GroupFormResult } from './group-form'
import { showSuccessNotification } from '../../../utils/custom-notifications'

export const CreateGroupButton = ({ onCreated }: { onCreated: () => void }) => {
  const [opened, setOpened] = useState(false)

  return (
    <>
      <Button leftIcon={<IconPlus size={16} />} onClick={() => setOpened(true)}>
        Stwórz
      </Button>
      <CreateGroupModal
        opened={opened}
        onClose={(createdGroup) => {
          setOpened(false)
          if (createdGroup) {
            onCreated()
          }
        }}
      />
    </>
  )
}

export const CreateGroupModal = ({
  opened,
  withStudents,
  onClose,
}: {
  opened: boolean
  withStudents?: string[]
  onClose: (createdGroup?: Group) => void
}) => {
  const [loading, setLoading] = useState(false)
  const createGroup = useGroupCreate()

  const createGroupHandler = async (data: GroupFormResult) => {
    setLoading(true)

    try {
      const createdGroup = await createGroup({
        name: data.name,
        students: data.students,
      })

      showSuccessNotification('Grupa została stworzona!')
      onClose(createdGroup)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title={'Stwórz grupę'} opened={opened} onClose={() => onClose()}>
      <GroupForm
        loading={loading}
        onSubmit={createGroupHandler}
        initialValues={{
          addStudents: Boolean(withStudents),
          students: withStudents ?? [],
          addTeacher: false,
          name: '',
        }}
        isEditing={false}
      />
    </Modal>
  )
}
