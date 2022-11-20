import { createSlice } from '@reduxjs/toolkit'

import { User } from '../../components/users/types'
import { userGet } from './thunks'

export interface UserStateType {
  loading: boolean
  loaded: boolean
  user: User | null
  error: boolean
}

const initialState: UserStateType = {
  loaded: false,
  loading: false,
  user: null,
  error: false,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    userClear(state) {
      state.loading = false
      state.loaded = false
      state.error = false
      state.user = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(userGet.pending, (state) => {
        state.loading = true
        state.loaded = false
        state.error = false
        state.user = null
      })
      .addCase(userGet.fulfilled, (state, action) => {
        state.loading = false
        state.loaded = true
        state.error = false
        state.user = action.payload
      })
      .addCase(userGet.rejected, (state) => {
        state.loading = false
        state.loaded = true
        state.error = true
        state.user = null
      })
  },
})

export * from './thunks'
export const { userClear } = userSlice.actions
export default userSlice.reducer
