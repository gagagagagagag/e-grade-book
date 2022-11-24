import { Loader } from '@mantine/core'

import {
  ErrorAlert,
  MultiSelectAll,
  MultiSelectPropsWithoutData,
  SelectAll,
  SelectPropsWithoutData,
} from '../ui'
import {
  GetAllParentsQuery,
  GetAllStudentsQuery,
  GetAllTeachersQuery,
  useGetAllParents,
  useGetAllStudents,
  useGetAllTechers,
} from './hooks'

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
    <SelectAll
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
    <SelectAll
      {...selectProps}
      data={(data || []).map((parent) => ({
        label: parent.name,
        value: parent._id,
      }))}
    />
  )
}

export const AllStudentsMultiSelect = ({
  notAssignedToParent,
  notAssignedToTeacher,
  ...selectProps
}: MultiSelectPropsWithoutData & GetAllStudentsQuery) => {
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
    <MultiSelectAll
      {...selectProps}
      data={(data || []).map((student) => ({
        label: student.name,
        value: student._id,
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
    <SelectAll
      {...selectProps}
      data={(data || []).map((student) => ({
        label: student.name,
        value: student._id,
      }))}
    />
  )
}
