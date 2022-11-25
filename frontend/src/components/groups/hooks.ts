import { useCallback } from 'react'
import useSWR from 'swr'
import backendAxios from '../../axios-instance'

import { fetchWithQuery, PaginationQuery, PaginationResponse } from '../data'
import { PopulatedUser } from '../users/types'
import { Group, GroupWithStudents } from './types'

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

export const useCombineGroupStudentNames = () => {
  return useCallback((students?: PopulatedUser[] | null) => {
    if (!students || !students.length) {
      return ''
    }

    const studentNames = students.reduce((res, student) => {
      if (student && student.name) {
        if (!res.length) {
          res = student.name
        } else {
          res = `${res}, ${student.name}`
        }
      }
      return res
    }, '')

    return studentNames
  }, [])
}

export const useGroupNameWithStudents = () => {
  const combineStudentNames = useCombineGroupStudentNames()

  return useCallback(
    (group: GroupWithStudents | null) => {
      if (!group) {
        return 'Brak grupy'
      }

      const studentNames = combineStudentNames(group.students)

      const isEmpty = !studentNames || studentNames.length === 0
      return `${group.name} (${isEmpty ? 'Brak uczniów' : studentNames})`
    },
    [combineStudentNames]
  )
}

export const useGroupCreate = () => {
  return async (attrs: Pick<Group, 'name' | 'students'>) => {
    const { data } = await backendAxios.post<Group>('/groups', attrs)

    return data
  }
}

export const useGroupUpdate = () => {
  return async (id: string, attrs: Pick<Group, 'name'>) => {
    const { data } = await backendAxios.put<GroupWithStudents>(
      `/groups/${id}`,
      attrs
    )

    return data
  }
}

export const useStudentAssignToGroup = () => {
  return async (studentId: string, groupId: string, add: boolean) => {
    return backendAxios.put('/groups/assignStudent', {
      studentId,
      groupId,
      add,
    })
  }
}
