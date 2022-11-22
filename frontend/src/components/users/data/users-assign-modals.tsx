import { Modal } from '@mantine/core'
import { useState } from 'react'
import { showSuccessNotification } from '../../../utils/custom-notifications'

import { useStudentAssignToTeacherOrParent } from '../hooks'
import {
  AssignUsersToTeacherForm,
  AssignUsersToTeacherFormResult,
} from './users-assign-forms'

export const AssignStudentsToTeacherModal = ({
  studentIds,
  opened,
  onClose,
}: {
  studentIds: string[]
  opened: boolean
  onClose: (success?: boolean) => void
}) => {
  const [loading, setLoading] = useState(false)
  const assignToTeacher = useStudentAssignToTeacherOrParent()

  const assignToTeacherHandler = async (
    data: AssignUsersToTeacherFormResult
  ) => {
    setLoading(true)

    try {
      for (const studentId of studentIds) {
        await assignToTeacher(studentId, data.teacherId, true)
      }

      showSuccessNotification(
        `Przypisano ${
          studentIds.length > 1 ? 'uczniów' : 'ucznia'
        } do nauczyciela`
      )
      onClose(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title={'Przypisz do nauczyciela'} opened={opened} onClose={onClose}>
      <AssignUsersToTeacherForm
        loading={loading}
        onSubmit={assignToTeacherHandler}
        notContainingStudents={studentIds}
      />
    </Modal>
  )
}

export const AssignUsersToParentModal = ({
  userIds,
  opened,
  onClose,
}: {
  userIds: string[]
  opened: boolean
  onClose: () => void
}) => {}
