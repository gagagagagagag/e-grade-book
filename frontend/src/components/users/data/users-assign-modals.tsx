import { Modal } from '@mantine/core'
import { useState } from 'react'

import { showSuccessNotification } from '../../../utils/custom-notifications'
import { useStudentAssignToGroup } from '../../groups/hooks'
import { useStudentAssignToTeacherOrParent } from '../hooks'
import {
  AssignStudentsToTargetForm,
  AssignStudentsToTargetFormResult,
} from './users-assign-forms'

export type AssignTarget = 'teacher' | 'parent' | 'group' | null

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
  const assignToGroup = useStudentAssignToGroup()

  if (!target) {
    return null
  }

  const assignToTargetHandler = async (
    data: AssignStudentsToTargetFormResult
  ) => {
    setLoading(true)

    try {
      for (const studentId of studentIds) {
        if (target === 'group') {
          await assignToGroup(studentId, data.targetId, true)
        } else {
          await assignToTarget(studentId, data.targetId, true)
        }
      }

      showSuccessNotification(
        `Przypisano ${studentIds.length > 1 ? 'uczniów' : 'ucznia'} do ${
          target === 'teacher'
            ? 'nauczyciela'
            : target === 'parent'
            ? 'rodzica'
            : 'grupy'
        }`
      )
      onClose(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={`Przypisz do ${
        target === 'parent'
          ? 'rodzica'
          : target === 'teacher'
          ? 'nauczyciela'
          : 'grupy'
      }`}
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
