import { Loader, Select, SelectProps } from '@mantine/core'

import { ErrorAlert } from '../ui'
import {
  GetAllParentsQuery,
  GetAllStudentsQuery,
  GetAllTeachersQuery,
  useGetAllParents,
  useGetAllStudents,
  useGetAllTechers,
} from './hooks'

type SelectPropsWithoutData = Omit<SelectProps, 'data'>

export const AllTeachersSelect = ({
  notContainingGroups,
  notContainingStudents,
  ...selectProps
}: SelectPropsWithoutData & GetAllTeachersQuery) => {
  const { isValidating, data, error } = useGetAllTechers({
    notContainingGroups,
    notContainingStudents,
  })

  if (error) {
    return (
      <ErrorAlert
        message={'Wystąpił błąd przy pobieraniu danych nauczycieli'}
      />
    )
  }

  if (isValidating) {
    return <Loader />
  }

  return (
    <AllUsersSelect
      {...selectProps}
      data={(data || []).map((teacher) => ({
        label: teacher.name,
        value: teacher._id,
      }))}
    />
  )
}

export const AllParentsSelect = ({
  notContainingStudents,
  ...selectProps
}: SelectPropsWithoutData & GetAllParentsQuery) => {
  const { isValidating, data, error } = useGetAllParents({
    notContainingStudents,
  })

  if (error) {
    return (
      <ErrorAlert message={'Wystąpił błąd przy pobieraniu danych rodziców'} />
    )
  }

  if (isValidating) {
    return <Loader />
  }

  return (
    <AllUsersSelect
      {...selectProps}
      data={(data || []).map((parent) => ({
        label: parent.name,
        value: parent._id,
      }))}
    />
  )
}

export const AllStudentsSelect = ({
  notAssignedToParent,
  notAssignedToTeacher,
  ...selectProps
}: SelectPropsWithoutData & GetAllStudentsQuery) => {
  const { isValidating, data, error } = useGetAllStudents({
    notAssignedToParent,
    notAssignedToTeacher,
  })

  if (error) {
    return (
      <ErrorAlert message={'Wystąpił błąd przy pobieraniu danych uczniów'} />
    )
  }

  if (isValidating) {
    return <Loader />
  }

  return (
    <AllUsersSelect
      {...selectProps}
      data={(data || []).map((student) => ({
        label: student.name,
        value: student._id,
      }))}
    />
  )
}

const AllUsersSelect = (props: SelectProps) => (
  <Select
    searchable
    {...props}
    disabled={props.data.length === 0 || props.disabled}
    placeholder={props.data.length === 0 ? 'Nie znaleziono' : props.placeholder}
  />
)