import { Modal } from '@mantine/core'
import { useState } from 'react'
import { showSuccessNotification } from '../../../utils/custom-notifications'

import { useStudentAssignToTeacherOrParent } from '../hooks'
import {
  AssignStudentsToTargetForm,
  AssignStudentsToTargetFormResult,
} from './users-assign-forms'

export type AssignTarget = 'teacher' | 'parent'

export const AssignStudentsToTargetModal = ({
  target,
  studentIds,
  opened,
  onClose,
}: {
  target: AssignTarget
  studentIds: string[]
  opened: boolean
  onClose: (success?: boolean) => void
}) => {
  const [loading, setLoading] = useState(false)
  const assignToTarget = useStudentAssignToTeacherOrParent()

  const assignToTargetHandler = async (
    data: AssignStudentsToTargetFormResult
  ) => {
    setLoading(true)

    try {
      for (const studentId of studentIds) {
        await assignToTarget(studentId, data.targetId, true)
      }

      showSuccessNotification(
        `Przypisano ${studentIds.length > 1 ? 'uczniów' : 'ucznia'} do ${
          target === 'teacher' ? 'nauczyciela' : 'rodzica'
        }`
      )
      onClose(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={`Przypisz do ${target === 'parent' ? 'rodzica' : 'nauczyciela'}`}
      opened={opened}
      onClose={onClose}
    >
      <AssignStudentsToTargetForm
        target={target}
        loading={loading}
        onSubmit={assignToTargetHandler}
        notContainingStudents={studentIds}
      />
    </Modal>
  )
}
