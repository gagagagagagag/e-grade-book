import { createAsyncThunk } from '@reduxjs/toolkit'

import backendAxios from '../../axios-instance'
import { User } from '../../components/users/types'
import { RootState } from '..'

export const userGet = createAsyncThunk<User, undefined, { state: RootState }>(
  'user/get',
  async (_, thunkApi) => {
    const { data } = await backendAxios.get<User>('/auth/whoami', {
      headers: {
        Authorization: `Bearer ${thunkApi.getState().auth.accessToken}`,
      },
    })

    return data
  }
)
