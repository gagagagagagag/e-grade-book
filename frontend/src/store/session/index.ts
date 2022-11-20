import { createSlice } from '@reduxjs/toolkit'
import { DateTime } from 'luxon'

export interface SessionStateType {
  active: boolean
  lastRefresh: string | null
  endedByTimeout: boolean
}

const initialState: SessionStateType = {
  active: false,
  lastRefresh: null,
  endedByTimeout: false,
}

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    sessionInit(state) {
      state.active = true
      state.lastRefresh = DateTime.now().toISO()
      state.endedByTimeout = false
    },
    sessionRefresh(state) {
      state.lastRefresh = DateTime.now().toISO()
    },
    sessionTerminate(state) {
      state.active = false
      state.lastRefresh = null
    },
    sessionClearTimeout(state) {
      state.endedByTimeout = false
    },
    sessionTimeout(state) {
      state.endedByTimeout = true
    },
  },
})

export const {
  sessionInit,
  sessionRefresh,
  sessionTerminate,
  sessionTimeout,
  sessionClearTimeout,
} = sessionSlice.actions
export default sessionSlice.reducer
