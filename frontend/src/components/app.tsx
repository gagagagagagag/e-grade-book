import { useEffect } from 'react'

import { AuthenticatePage } from '../pages'
import {
  useAppDispatch,
  useAppSelector,
  authInitialize,
  logout,
} from '../store'
import { AppLoading } from './app-loading'
import { AuthController, Session, SessionController } from './auth'

export const App = () => {
  const dispatch = useAppDispatch()
  const [appInitialized, appInitializing, isLoggedIn] = useAppSelector(
    (state) => [
      state.auth.initialized,
      state.auth.initializing,
      state.auth.isLoggedIn,
    ]
  )

  useEffect(() => {
    dispatch(authInitialize())
  }, [dispatch])

  if (!appInitialized && appInitializing) {
    return <AppLoading />
  }

  if (appInitialized && !isLoggedIn) {
    return <AuthenticatePage />
  }

  return (
    <>
      <AuthController />
      <SessionController />
      <Session />
      <span>App</span>
      <button onClick={() => dispatch(logout())}>loguot</button>
    </>
  )
}
