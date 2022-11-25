// import { Select } from '@mantine/core'

import { UserRoles } from '../../users/types'

export const LessonsStudent = ({ currentRole }: { currentRole: UserRoles }) => {
  // return (
  //   <Select
  //     defaultValue={'1'}
  //     data={[{ label: 'Jakub Przywara', value: '1' }]}
  //   />
  // )

  if (currentRole !== UserRoles.Parent) {
    return null
  }

  // // return SelectMyStudent variant unstyled
  return null
}
