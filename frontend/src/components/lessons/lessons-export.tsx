import { Button } from '@mantine/core'
import { IconTableExport } from '@tabler/icons'

import { UserRoles } from '../users/types'

export const LessonsExportButton = ({
  currentRole,
}: {
  currentRole: UserRoles
}) => {
  if (currentRole !== UserRoles.Admin && currentRole !== UserRoles.Teacher) {
    return null
  }

  return (
    <Button leftIcon={<IconTableExport size={16} />}>Eksportuj lekcje</Button>
  )
}

export const LessonsExportModal = () => {
  return null
}
