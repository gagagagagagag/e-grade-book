import { useCallback, useEffect, useState, memo } from 'react'
import { DateTime } from 'luxon'

import {
  authRefresh,
  logout,
  useAppDispatch,
  useAppSelector,
} from '../../store'
import { AUTH_LOGOUT_AFTER_MINUTES, AUTH_REFRESH_INTERVAL } from './const'

export const AuthController = memo(() => {
  const dispatch = useAppDispatch()
  const [windowInFocus, setWindowInFocus] = useState(true)
  const lastRefresh = useAppSelector((state) => state.auth.lastRefresh)

  const windowFocusHandler = useCallback(() => {
    if (lastRefresh) {
      const { minutes: minutesFromLastRefresh } = DateTime.fromISO(lastRefresh)
        .diffNow('minutes')
        .toObject()
      const { milliseconds: millisecondsFromLastRefresh } = DateTime.fromISO(
        lastRefresh
      )
        .diffNow('milliseconds')
        .toObject()

      if (Math.abs(minutesFromLastRefresh!) > AUTH_LOGOUT_AFTER_MINUTES) {
        return dispatch(logout())
      } else if (
        Math.abs(millisecondsFromLastRefresh!) > AUTH_REFRESH_INTERVAL
      ) {
        dispatch(authRefresh())
      }
    }

    setWindowInFocus(true)
  }, [lastRefresh, dispatch])

  const windowBlurHandler = useCallback(() => {
    setWindowInFocus(false)
  }, [])

  useEffect(() => {
    window.addEventListener('focus', windowFocusHandler)
    window.addEventListener('blur', windowBlurHandler)

    return () => {
      window.removeEventListener('focus', windowFocusHandler)
      window.removeEventListener('blur', windowBlurHandler)
    }
  }, [windowBlurHandler, windowFocusHandler])

  useEffect(() => {
    if (windowInFocus) {
      const interval = setInterval(() => {
        dispatch(authRefresh())
      }, AUTH_REFRESH_INTERVAL)

      return () => {
        clearInterval(interval)
      }
    }
  }, [windowInFocus, dispatch])

  return null
})
