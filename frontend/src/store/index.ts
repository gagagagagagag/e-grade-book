import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'

import authReducer from './auth'
import sessionReducer from './session'
import userReducer from './user'

const store = configureStore({
  devTools: true,
  reducer: {
    auth: authReducer,
    session: sessionReducer,
    user: userReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export * from './auth'
export * from './session'
export * from './user'

export default store
