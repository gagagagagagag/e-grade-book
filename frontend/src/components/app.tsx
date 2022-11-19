import { useEffect } from 'react'

import { AuthenticatePage } from '../pages'
import { useAppDispatch, useAppSelector, authInitialize } from '../store'
import { AppLoading } from './app-loading'

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
  }, [])

  if (!appInitialized && appInitializing) {
    return <AppLoading />
  }

  if (appInitialized && !isLoggedIn) {
    return <AuthenticatePage />
  }

  return <span>App</span>
}
