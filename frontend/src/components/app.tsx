import React, { useCallback, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { SWRConfig } from 'swr'

import backendAxios from '../axios-instance'
import { AuthenticatePage, DashboardPage } from '../pages'
import { useAppDispatch, useAppSelector, authInitialize } from '../store'
import { AppLoading } from './app-loading'
import { AuthController, InitializeUser, SessionController } from './auth'
import { AppLayout } from './ui'

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
    <InitializeUser>
      <AppFetcher>
        <AuthController />
        <SessionController />
        <Routes>
          <Route element={<AppLayout />}>
            <Route path={'/'} element={<DashboardPage />} />
            <Route path={'*'} element={<Navigate to={'/'} />} />
          </Route>
        </Routes>
      </AppFetcher>
    </InitializeUser>
  )
}

const AppFetcher = ({ children }: { children: React.ReactNode }) => {
  const accessToken = useAppSelector((state) => state.auth.accessToken)

  const fetcher = useCallback(
    async (url: string) => {
      const { data } = await backendAxios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      return data
    },
    [accessToken]
  )

  return <SWRConfig value={{ fetcher }}>{children}</SWRConfig>
}
