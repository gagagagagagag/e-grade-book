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
