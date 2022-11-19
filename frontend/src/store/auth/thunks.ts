import { DateTime } from 'luxon'
import { createAsyncThunk } from '@reduxjs/toolkit'

import backendAxios from '../../axios-instance'

const SESSION_LENGTH = 60

const getFromSessionStorageAndRefresh = async () => {
  const lastRefresh = sessionStorage.getItem('lastRefresh')
  const refreshToken = sessionStorage.getItem('refreshToken')

  const clearAndReject = () => {
    sessionStorage.removeItem('lastRefresh')
    sessionStorage.removeItem('lastRefresh')
    return Promise.reject()
  }

  if (lastRefresh && refreshToken) {
    const lastRefreshDate = DateTime.fromISO(lastRefresh)

    const { minutes } = lastRefreshDate.diffNow('minutes').toObject()
    if (!minutes || minutes > SESSION_LENGTH) {
      return clearAndReject()
    }

    try {
      const { data } = await backendAxios.post<{
        accessToken: string
        refreshToken: string
      }>('/auth/refresh', { refreshToken })

      const newLastRefresh = DateTime.now().toISO()
      sessionStorage.setItem('refreshToken', data.refreshToken)
      sessionStorage.setItem('lastRefresh', newLastRefresh)

      return {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        lastRefresh: newLastRefresh,
      }
    } catch (e) {
      return clearAndReject()
    }
  }

  return clearAndReject()
}

export const authRefresh = createAsyncThunk(
  'auth/refresh',
  getFromSessionStorageAndRefresh
)

export const authInitialize = createAsyncThunk(
  'auth/initialize',
  getFromSessionStorageAndRefresh
)
