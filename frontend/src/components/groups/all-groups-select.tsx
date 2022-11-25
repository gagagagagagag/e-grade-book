import { Loader } from '@mantine/core'

import { ErrorAlert, SelectAll, SelectPropsWithoutData } from '../ui'
import {
  useGetAllGroups,
  GetAllGroupsQuery,
  useGroupNameWithStudents,
  useGetMyGroups,
} from './hooks'

export const MyGroupsSelect = (selectProps: SelectPropsWithoutData) => {
  const getGroupName = useGroupNameWithStudents()
  const { data, isValidating, error } = useGetMyGroups()

  if (error) {
    return <ErrorAlert message={'Wystąpił błąd przy pobieraniu danych grup'} />
  }

  if (isValidating) {
    return <Loader />
  }

  return (
    <SelectAll
      {...selectProps}
      data={(data || []).map((group) => ({
        label: getGroupName(group),
        value: group._id,
      }))}
    />
  )
}

export const AllGroupsSelect = ({
  notAssignedToTeacher,
  notContainingStudents,
  ...selectProps
}: SelectPropsWithoutData & GetAllGroupsQuery) => {
  const getGroupName = useGroupNameWithStudents()
  const { data, isValidating, error } = useGetAllGroups({
    notAssignedToTeacher,
    notContainingStudents,
  })

  if (error) {
    return <ErrorAlert message={'Wystąpił błąd przy pobieraniu danych grup'} />
  }

  if (isValidating) {
    return <Loader />
  }

  return (
    <SelectAll
      {...selectProps}
      data={(data || []).map((group) => ({
        label: getGroupName(group),
        value: group._id,
      }))}
    />
  )
}
