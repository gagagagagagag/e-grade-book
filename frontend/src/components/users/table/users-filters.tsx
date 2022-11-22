import { Select } from '@mantine/core'

import { UserRoles } from '../types'

export const UsersFilters = ({
  role,
  onRoleChange,
}: {
  role: UserRoles | undefined
  onRoleChange: (role: UserRoles | undefined) => void
}) => {
  const roleChangeHandler = (value: UserRoles | 'all') => {
    if (value === 'all') {
      onRoleChange(undefined)
    } else {
      onRoleChange(value)
    }
  }

  return (
    <Select
      label={'Rola'}
      variant={'filled'}
      data={[
        {
          label: 'Wszystkie',
          value: 'all',
        },
        {
          label: 'Nauczyciele',
          value: UserRoles.Teacher,
        },
        {
          label: 'Rodzice',
          value: UserRoles.Parent,
        },
        {
          label: 'Uczniowie',
          value: UserRoles.Student,
        },
      ]}
      value={role ?? 'all'}
      onChange={roleChangeHandler}
    />
  )
}
