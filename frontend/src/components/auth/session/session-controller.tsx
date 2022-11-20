import { useCallback, useEffect } from 'react'
import { debounce } from 'lodash'

import {
  useAppDispatch,
  sessionRefresh,
  sessionInit,
  sessionTerminate,
} from '../../../store'
import { SESSION_DEBOUNCE_WAIT } from './const'

export const SessionController = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(sessionInit())

    return () => {
      dispatch(sessionTerminate())
    }
  }, [dispatch])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedRefreshSession = useCallback(
    debounce(() => dispatch(sessionRefresh()), SESSION_DEBOUNCE_WAIT, {
      maxWait: SESSION_DEBOUNCE_WAIT,
      trailing: true,
    }),
    [dispatch]
  )

  const windowClickHandler = useCallback(() => {
    debouncedRefreshSession()
  }, [debouncedRefreshSession])

  useEffect(() => {
    window.addEventListener('click', windowClickHandler)

    return () => {
      window.removeEventListener('click', windowClickHandler)
    }
  }, [windowClickHandler])

  return null
}
