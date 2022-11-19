import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { DateTime } from 'luxon'

import { AuthTokens } from '../../components/auth/types'
import { authInitialize, authRefresh } from './thunks'

export interface AuthStateType {
  initializing: boolean
  initialized: boolean
  refreshing: boolean
  isLoggedIn: boolean
  accessToken: string | null
  refreshToken: string | null
  lastRefresh: string | null
}

const initialState: AuthStateType = {
  initializing: true,
  initialized: false,
  refreshing: false,
  isLoggedIn: false,
  accessToken: null,
  refreshToken: null,
  lastRefresh: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<AuthTokens>) {
      state.isLoggedIn = true
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken

      const dateNow = DateTime.now().toISO()
      sessionStorage.setItem('lastRefresh', dateNow)
      sessionStorage.setItem('refreshToken', action.payload.refreshToken)

      state.lastRefresh = dateNow
    },
    logout(state) {
      state.isLoggedIn = false
      state.accessToken = null
      state.refreshToken = null
      state.lastRefresh = null

      sessionStorage.removeItem('lastRefresh')
      sessionStorage.removeItem('refreshToken')
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(authInitialize.pending, (state) => {
        state.initializing = true
        state.initialized = false
        state.isLoggedIn = false
        state.lastRefresh = null
        state.accessToken = null
        state.refreshToken = null
      })
      .addCase(authInitialize.fulfilled, (state, action) => {
        state.initializing = false
        state.initialized = true
        state.isLoggedIn = true
        state.refreshToken = action.payload.refreshToken
        state.accessToken = action.payload.accessToken
        state.lastRefresh = action.payload.lastRefresh
      })
      .addCase(authInitialize.rejected, (state, action) => {
        state.initializing = false
        state.initialized = true
        state.isLoggedIn = false
      })
      .addCase(authRefresh.pending, (state) => {
        state.refreshing = true
      })
      .addCase(authRefresh.fulfilled, (state, action) => {
        state.refreshing = false
        state.accessToken = action.payload.accessToken
        state.refreshToken = action.payload.refreshToken
        state.lastRefresh = action.payload.lastRefresh
      })
      .addCase(authRefresh.rejected, (state) => {
        state.isLoggedIn = false
        state.accessToken = null
        state.refreshToken = null
        state.lastRefresh = null
      })
  },
})

export * from './thunks'
export const { loginSuccess, logout } = authSlice.actions
export default authSlice.reducer
