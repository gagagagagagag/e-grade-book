import useSWR from 'swr'

import { User } from './types'
import { fetchWithQuery, PaginationQuery, PaginationResponse } from '../data'

export interface GetUsersQuery extends PaginationQuery {
  role?: string
}

export const useGetUsers = (query: GetUsersQuery) => {
  return useSWR<PaginationResponse<User>>(['/users', query], fetchWithQuery)
}
