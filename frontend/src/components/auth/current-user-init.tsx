import React, { useEffect } from 'react'
import { Center } from '@mantine/core'

import {
  useAppDispatch,
  useAppSelector,
  userGet,
  userClear,
  logout,
} from '../../store'
import { AppLoading } from '../app-loading'
import { ErrorAlert } from '../ui'

export const InitializeUser = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch()
  const { loaded, loading, error, user } = useAppSelector((state) => state.user)

  useEffect(() => {
    dispatch(userGet())

    return () => {
      dispatch(userClear())
    }
  }, [dispatch])

  if ((!error && !user) || loading || !loaded) {
    return <AppLoading />
  }

  if (error) {
    return (
      <Center>
        <ErrorAlert
          message={
            'Niestety nie mogliśmy odnaleźć Cię w naszej bazie danych, wyloguj się i spróbuj ponownie lub skontaktuj się z nami'
          }
          buttonText={'Wyloguj się'}
          onClick={() => dispatch(logout())}
        />
      </Center>
    )
  }

  return <>{children}</>
}
