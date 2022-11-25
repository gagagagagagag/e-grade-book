import { DateRangePicker } from '@mantine/dates'

import { AllGroupsSelect } from '../../groups/all-groups-select'
import {
  AllStudentsSelect,
  AllTeachersSelect,
} from '../../users/all-users-select'
import { UserRoles } from '../../users/types'

export const LessonsFilters = ({ currentRole }: { currentRole: UserRoles }) => {
  return (
    <>
      <DateRangePicker
        label={'Data'}
        variant={'filled'}
        allowSingleDateInRange
      />
      {currentRole === UserRoles.Admin && (
        <AllTeachersSelect label={'Nauczyciel'} variant={'filled'} clearable />
      )}
      {currentRole === UserRoles.Admin ? (
        <AllGroupsSelect label={'Grupa'} variant={'filled'} clearable />
      ) : currentRole === UserRoles.Teacher ? null : null}
      {currentRole === UserRoles.Admin ? (
        <AllStudentsSelect label={'Uczeń'} variant={'filled'} clearable />
      ) : currentRole === UserRoles.Student ? null : null}
    </>
  )
}
