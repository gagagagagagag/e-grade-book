import useSWR from 'swr'

import { fetchWithQuery, PaginationQuery, PaginationResponse } from '../data'
import { Group } from './types'

export interface GetGroupsQuery extends PaginationQuery {}

export const useGetGroups = (query: GetGroupsQuery) => {
  return useSWR<PaginationResponse<Group>>(['/groups', query], fetchWithQuery)
}
