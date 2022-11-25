import { useEffect } from 'react'
import { useCurrentUser } from '../../auth/hooks'
import { MyStudentsSelect } from '../../users/all-users-select'
import { Parent, UserRoles } from '../../users/types'

export const LessonsStudent = ({
  currentRole,
  studentFilter,
  onStudentFilterChange,
}: {
  currentRole: UserRoles
  studentFilter: string | null
  onStudentFilterChange: (value: string) => void
}) => {
  if (currentRole !== UserRoles.Parent) {
    return null
  }

  return (
    <LessonsStudentSelect
      studentFilter={studentFilter}
      onStudentFilterChange={onStudentFilterChange}
    />
  )
}

const LessonsStudentSelect = ({
  studentFilter,
  onStudentFilterChange,
}: {
  studentFilter: string | null
  onStudentFilterChange: (value: string) => void
}) => {
  const currentUser = useCurrentUser<Parent>()

  const [student, secondStudent] = currentUser?.students ?? []

  useEffect(() => {
    if (student && !studentFilter) {
      onStudentFilterChange(student)
    }
  }, [student, studentFilter, onStudentFilterChange])

  if (!student) {
    return null
  }

  return (
    <MyStudentsSelect
      value={studentFilter}
      onChange={onStudentFilterChange}
      disabled={!Boolean(secondStudent)}
      variant={'filled'}
    />
  )
}
