import { showNotification } from '@mantine/notifications'
import { IconCircleCheck, IconMoodSad } from '@tabler/icons'

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
