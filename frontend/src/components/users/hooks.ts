import useSWR from 'swr'

import { User } from './types'
import { fetchWithQuery, PaginationQuery, PaginationResponse } from '../data'
import backendAxios from '../../axios-instance'

export interface GetUsersQuery extends PaginationQuery {
  role?: string
}

export const useGetUsers = (query: GetUsersQuery) => {
  return useSWR<PaginationResponse<User>>(['/users', query], fetchWithQuery)
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
