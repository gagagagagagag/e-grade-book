import useSWR from 'swr'

import { fetchWithQuery, PaginationQuery, PaginationResponse } from '../data'
import { Lesson } from './types'

export interface GetLessonsQuery extends PaginationQuery {
  from?: string | null
  to?: string | null
  teacher?: string | null
  group?: string | null
  student?: string | null
}

export const useGetLessons = (query: GetLessonsQuery) => {
  return useSWR<PaginationResponse<Lesson>>(['/lessons', query], fetchWithQuery)
}
