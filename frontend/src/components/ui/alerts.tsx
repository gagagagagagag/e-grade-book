import { ReactNode } from 'react'
import { Alert, Stack, Text, Button } from '@mantine/core'
import { IconCircleCheck, IconAlertCircle, IconInfoCircle } from '@tabler/icons'

export interface CustomAlertProps {
  message: string
  buttonText?: string
  onClick?: () => void
}

const CustomAlert = ({
  title,
  color,
  icon,
  message,
  buttonText,
  onClick,
}: {
  title: string
  color: string
  icon: ReactNode
  message: string
  buttonText?: string
  onClick?: () => void
}) => {
  return (
    <Alert title={title} icon={icon} color={color}>
      <Stack spacing={'md'}>
        <Text weight={400}>{message}</Text>
        {onClick && (
          <Button onClick={onClick} color={color}>
            {buttonText}
          </Button>
        )}
      </Stack>
    </Alert>
  )
}

export const SuccessAlert = ({
  message,
  buttonText,
  onClick,
}: CustomAlertProps) => {
  return (
    <CustomAlert
      title={'Sukces 🎉'}
      color={'teal'}
      icon={<IconCircleCheck size={16} />}
      message={message}
      buttonText={buttonText}
      onClick={onClick}
    />
  )
}

export const InfoAlert = ({
  message,
  buttonText,
  onClick,
}: CustomAlertProps) => {
  return (
    <CustomAlert
      title={'Informacja 🤓'}
      color={'blue'}
      icon={<IconInfoCircle size={16} />}
      message={message}
      buttonText={buttonText}
      onClick={onClick}
    />
  )
}

export const ErrorAlert = ({
  message,
  buttonText,
  onClick,
}: CustomAlertProps) => {
  return (
    <CustomAlert
      title={'Błąd 😭'}
      color={'red'}
      icon={<IconAlertCircle size={16} />}
      message={message}
      buttonText={buttonText}
      onClick={onClick}
    />
  )
}
