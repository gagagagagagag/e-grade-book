import { createSlice } from '@reduxjs/toolkit'

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
  reducers: {},
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
export const {} = authSlice.actions
export default authSlice.reducer
