import { showNotification, hideNotification } from '@mantine/notifications'

import backendAxios from '../../axios-instance'
import { logout, useAppDispatch, useAppSelector } from '../../store'
import { showSuccessNotification } from '../../utils/custom-notifications'

export const useCurrentUser = () => {
  const user = useAppSelector((state) => state.user.user)

  return user!
}

export const useCurrentRole = () => {
  const user = useCurrentUser()

  return user.role
}

export const useLogout = () => {
  const dispatch = useAppDispatch()

  return () => dispatch(logout())
}

export const useSendPasswordEmailByAdmin = () => {
  return async (id: string, isReset: boolean) => {
    const notificationId = 'load-send-password-link-admin'

    try {
      showNotification({
        id: notificationId,
        loading: true,
        title: 'Ładowanie...',
        message: `Trwa wysyłanie maila z linkiem do ${
          isReset ? 'zresetowania' : 'stworzenia'
        } hasła`,
        autoClose: false,
        disallowClose: true,
      })

      await backendAxios.post('/auth/sendPasswordLink/admin', {
        userId: id,
      })

      showSuccessNotification('Email został wysłany!')
    } finally {
      hideNotification(notificationId)
    }
  }
}
