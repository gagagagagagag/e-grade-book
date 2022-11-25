import { DateRangePicker, DateRangePickerValue } from '@mantine/dates'
import { DateTime } from 'luxon'

import { AllGroupsSelect, MyGroupsSelect } from '../../groups/all-groups-select'
import {
  AllStudentsSelect,
  AllTeachersSelect,
  MyStudentsSelect,
} from '../../users/all-users-select'
import { UserRoles } from '../../users/types'

export const LessonsFilters = ({
  currentRole,
  dateFromTo,
  onDateFromToChange,
  teacherFilter,
  onTeacherFilterChange,
  groupFilter,
  onGroupFilterChange,
  studentFilter,
  onStudentFilterChange,
}: {
  currentRole: UserRoles
  dateFromTo: DateRangePickerValue
  onDateFromToChange: (value: DateRangePickerValue) => void
  teacherFilter: string | null
  onTeacherFilterChange: (value: string) => void
  groupFilter: string | null
  onGroupFilterChange: (value: string) => void
  studentFilter: string | null
  onStudentFilterChange: (value: string) => void
}) => {
  return (
    <>
      <DateRangePicker
        value={dateFromTo}
        onChange={onDateFromToChange}
        maxDate={DateTime.now().toJSDate()}
        label={'Data'}
        variant={'filled'}
        allowSingleDateInRange={false}
      />
      {currentRole === UserRoles.Admin && (
        <AllTeachersSelect
          value={teacherFilter}
          onChange={onTeacherFilterChange}
          label={'Nauczyciel'}
          variant={'filled'}
          clearable
        />
      )}
      {currentRole === UserRoles.Admin ? (
        <AllGroupsSelect
          value={groupFilter}
          onChange={onGroupFilterChange}
          label={'Grupa'}
          variant={'filled'}
          clearable
        />
      ) : currentRole === UserRoles.Teacher ? (
        <MyGroupsSelect
          value={groupFilter}
          onChange={onGroupFilterChange}
          label={'Grupa'}
          variant={'filled'}
          clearable
        />
      ) : null}
      {currentRole === UserRoles.Admin ? (
        <AllStudentsSelect
          value={studentFilter}
          onChange={onStudentFilterChange}
          label={'Uczeń'}
          variant={'filled'}
          clearable
        />
      ) : currentRole === UserRoles.Teacher ? (
        <MyStudentsSelect
          value={studentFilter}
          onChange={onStudentFilterChange}
          label={'Uczeń'}
          variant={'filled'}
          clearable
        />
      ) : null}
    </>
  )
}
