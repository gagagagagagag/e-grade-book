import { Badge } from '@mantine/core'
import { UserRoles } from './types'

export const UserBadge = ({ role }: { role: UserRoles }) => {
  let label: string
  let color: string

  if (role === UserRoles.Admin) {
    label = 'Admin'
    color = 'pink'
  } else if (role === UserRoles.Parent) {
    label = 'Rodzic'
    color = 'teal'
  } else if (role === UserRoles.Teacher) {
    label = 'Nauczyciel'
    color = 'orange'
  } else {
    label = 'Uczeń'
    color = 'violet'
  }

  return (
    <Badge color={color} variant={'light'}>
      {label}
    </Badge>
  )
}
