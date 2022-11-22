import useSWR from 'swr'

import { Parent, Student, Teacher, User, UserRoles } from './types'
import { fetchWithQuery, PaginationQuery, PaginationResponse } from '../data'
import backendAxios from '../../axios-instance'

export interface GetUsersQuery extends PaginationQuery {
  role?: string
}

export const useGetUsers = (query: GetUsersQuery) => {
  return useSWR<PaginationResponse<User>>(['/users', query], fetchWithQuery)
}

export interface GetAllTeachersQuery {
  notContainingStudents?: string[]
  notContainingGroups?: string[]
}

export const useGetAllTechers = (query: GetAllTeachersQuery) => {
  return useSWR<Teacher[]>(
    [`/users/all/${UserRoles.Teacher}`, query],
    fetchWithQuery
  )
}

export interface GetAllParentsQuery {
  notContainingStudents?: string[]
}

export const useGetAllParents = (query: GetAllParentsQuery) => {
  return useSWR<Parent[]>(
    [`/users/all/${UserRoles.Parent}`, query],
    fetchWithQuery
  )
}

export interface GetAllStudentsQuery {
  notAssignedToTeacher?: string
  notAssignedToParent?: string
}

export const useGetAllStudents = (query: GetAllStudentsQuery) => {
  return useSWR<Student[]>(
    [`/users/all/${UserRoles.Student}`, query],
    fetchWithQuery
  )
}

export const useUserCreate = () => {
  return async (
    attrs: Pick<User, 'name' | 'email' | 'role'> & {
      sendEmail: boolean
      password?: string
    }
  ) => {
    const { data } = await backendAxios.post<User>('/auth/createUser', attrs)

    return data
  }
}

export const useUserUpdate = () => {
  return async (id: string, attrs: Pick<User, 'name' | 'email'>) => {
    const { data } = await backendAxios.put<User>(`/users/${id}`, attrs)

    return data
  }
}

export const useStudentAssignToTeacherOrParent = () => {
  return async (studentId: string, targetId: string, add: boolean) => {
    return backendAxios.put('/users/assignStudent', {
      studentId,
      targetId,
      add,
    })
  }
}
