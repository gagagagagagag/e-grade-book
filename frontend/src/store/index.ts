import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'

import authReducer from './auth'
import sessionReducer from './session'
import userReducer from './user'
import navigationReducer from './navigation'

const store = configureStore({
  devTools: true,
  reducer: {
    auth: authReducer,
    session: sessionReducer,
    user: userReducer,
    navigation: navigationReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export * from './auth'
export * from './session'
export * from './user'
export * from './navigation'

export default store
