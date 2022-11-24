import { showNotification } from '@mantine/notifications'
import { IconAlertTriangle, IconCircleCheck, IconMoodSad } from '@tabler/icons'

export const showSuccessNotification = (
  message: string,
  { title = 'Sukces!' } = {}
) =>
  showNotification({
    title,
    message,
    color: 'teal',
    icon: <IconCircleCheck />,
  })

export const showWarningNotification = (
  message: string,
  { title = 'Uwaga! ⚠️' } = {}
) =>
  showNotification({
    title,
    message,
    color: 'yellow',
    icon: <IconAlertTriangle />,
  })

export const showErrorNotification = (
  message: string,
  { title = 'Ups!' } = {}
) =>
  showNotification({
    title,
    message,
    color: 'red',
    icon: <IconMoodSad />,
  })
