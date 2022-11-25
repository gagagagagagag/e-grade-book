import useSWR from 'swr'

import { fetchWithQuery, PaginationQuery, PaginationResponse } from '../data'
import { Lesson } from './types'

export interface GetLessonsQuery extends PaginationQuery {}

export const useGetLessons = (query: GetLessonsQuery) => {
  return useSWR<PaginationResponse<Lesson>>(['/lessons', query], fetchWithQuery)
}
