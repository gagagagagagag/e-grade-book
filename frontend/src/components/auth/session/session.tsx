import { useEffect, useState } from 'react'
import { DateTime } from 'luxon'

import {
  logout,
  useAppDispatch,
  useAppSelector,
  sessionTimeout,
} from '../../../store'
import { SESSION_CHECK_DELAY, SESSION_PERIOD_MINUTES } from './const'

export const Session = () => {
  const dispatch = useAppDispatch()
  const sessionLastRefresh = useAppSelector(
    (state) => state.session.lastRefresh
  )
  const [sessionCountdown, setSessionCountdown] = useState<string | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      if (sessionLastRefresh) {
        const dateLastRefresh = DateTime.fromISO(sessionLastRefresh).plus({
          minutes: SESSION_PERIOD_MINUTES,
        })

        const countdown = dateLastRefresh.diffNow('seconds')

        if ((countdown.toObject().seconds ?? 1) < 0) {
          dispatch(sessionTimeout())
          dispatch(logout())
        }

        setSessionCountdown(countdown.toFormat('mm:ss'))
      }
    }, SESSION_CHECK_DELAY)

    return () => clearInterval(interval)
  }, [sessionLastRefresh, dispatch])

  return (
    <>
      <span>Session time: {sessionCountdown}</span>
    </>
  )
}
