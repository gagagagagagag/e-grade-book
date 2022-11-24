import { useCallback } from 'react'
import useSWR from 'swr'

import { fetchWithQuery, PaginationQuery, PaginationResponse } from '../data'
import { GroupWithStudents } from './types'

export interface GetGroupsQuery extends PaginationQuery {}

export const useGetGroups = (query: GetGroupsQuery) => {
  return useSWR<PaginationResponse<GroupWithStudents>>(
    ['/groups', query],
    fetchWithQuery
  )
}

export interface GetAllGroupsQuery {
  notAssignedToTeacher?: string
  notContainingStudents?: string[]
}

export const useGetAllGroups = (query: GetAllGroupsQuery) => {
  return useSWR<GroupWithStudents[]>(['/groups/all', query], fetchWithQuery)
}

export const useGroupNameWithStudents = () => {
  return useCallback((group: GroupWithStudents | null) => {
    if (!group) {
      return 'Brak grupy'
    }

    const studentNames = group.students?.reduce((res, student) => {
      if (student && student.name) {
        if (!res.length) {
          res = student.name
        } else {
          res = `${res}, ${student.name}`
        }
      }
      return res
    }, '')

    const isEmpty = !studentNames || studentNames.length === 0
    return `${group.name} (${isEmpty ? 'Brak uczniów' : studentNames})`
  }, [])
}
