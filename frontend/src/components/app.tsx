import React, { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import backendAxios from '../axios-instance'
import { AuthenticatePage, DashboardPage, ManageUsersPage } from '../pages'
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
            <Route path={'/user-management'} element={<ManageUsersPage />} />
            <Route path={'*'} element={<Navigate to={'/'} />} />
          </Route>
        </Routes>
      </AppFetcher>
    </InitializeUser>
  )
}

const AppFetcher = ({ children }: { children: React.ReactNode }) => {
  const [accessTokenIncluded, setAccessTokenIncluded] = useState(false)
  const accessToken = useAppSelector((state) => state.auth.accessToken)

  useEffect(() => {
    backendAxios.defaults.headers.common['Authorization'] = accessToken
      ? `Bearer ${accessToken}`
      : null

    setAccessTokenIncluded(true)
  }, [accessToken])

  if (!accessTokenIncluded) {
    return null
  }

  return <>{children}</>
}
