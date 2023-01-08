import useSWR from 'swr'

import { basicFetch } from '../data'
import { DashboardData } from './types'

export const useMyDashboard = () => {
  return useSWR<DashboardData>('/dashboard/user', basicFetch)
}
