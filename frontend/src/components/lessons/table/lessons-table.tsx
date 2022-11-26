import { useState, useMemo } from 'react'
import { DateTime } from 'luxon'
import { Group, Text } from '@mantine/core'
import {
  createColumnHelper,
  PaginationState,
  SortingState,
} from '@tanstack/react-table'
import { DateRangePickerValue } from '@mantine/dates'
import { IconUser, IconUsers } from '@tabler/icons'

import { useCurrentRole } from '../../auth/hooks'
import { IntegratedTable, TableFilters } from '../../table'
import { UserRoles } from '../../users/types'
import { ErrorAlert } from '../../ui'
import { LessonsExportButton } from '../lessons-export'
import { LessonPresence, LessonWithUsers } from '../types'
import { useGetLessons } from '../hooks'
import { LessonsActions } from './lessons-actions'
import { LessonsFilters } from './lessons-filters'
import { LessonsStudent } from './lessons-student'
import {
  ViewLessonHomework,
  ViewLessonNote,
  ViewLessonPresence,
} from '../lesson-fields'

export const LessonsTable = () => {
  const currentRole = useCurrentRole()
  const [dateFromTo, setDateFromTo] = useState<DateRangePickerValue>([
    null,
    null,
  ])
  const [dateFromFilter, dateToFilter] = dateFromTo
  const [teacherFilter, setTeacherFilter] = useState<string | null>(null)
  const [groupFilter, setGroupFilter] = useState<string | null>(null)
  const [studentFilter, setStudentFilter] = useState<string | null>(null)
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'date',
      desc: true,
    },
  ])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  })
  const { data, isValidating, error } = useGetLessons({
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
    sortField: sorting.length ? sorting[0].id : undefined,
    sortDirection: sorting.length
      ? sorting[0].desc
        ? 'desc'
        : 'asc'
      : undefined,
    from: dateFromFilter
      ? DateTime.fromJSDate(dateFromFilter).startOf('day').toISO()
      : undefined,
    to: dateToFilter
      ? DateTime.fromJSDate(dateToFilter).endOf('day').toISO()
      : undefined,
    teacher: teacherFilter,
    group: groupFilter,
    student: studentFilter,
  })

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<LessonWithUsers>()

    const targetColumn = columnHelper.display({
      id: 'target',
      header: 'Uczestnik',
      cell: ({ row }) => <ShowTarget lesson={row.original} />,
    })
    const dateColumn = columnHelper.accessor('date', {
      id: 'date',
      header: 'Data',
      cell: ({ getValue }) =>
        DateTime.fromISO(getValue()).toFormat('dd.MM.yyyy'),
    })
    const durationColumn = columnHelper.accessor('duration', {
      id: 'duration',
      header: 'Czas trwania',
      cell: ({ getValue }) => <ShowLessonDuration duration={getValue()} />,
    })
    const actionsColumn = columnHelper.display({
      id: 'actions',
      cell: ({ row }) => <LessonsActions lesson={row.original} />,
    })

    if (currentRole === UserRoles.Admin) {
      return [
        columnHelper.accessor('teacher', {
          id: 'teacher',
          header: 'Nauczyciel',
          cell: ({ getValue }) => <ShowTeacher name={getValue()?.name} />,
        }),
        targetColumn,
        dateColumn,
        durationColumn,
        actionsColumn,
      ]
    } else if (currentRole === UserRoles.Teacher) {
      return [targetColumn, dateColumn, durationColumn, actionsColumn]
    } else {
      return [
        dateColumn,
        columnHelper.display({
          id: 'presence',
          header: 'Obecność',
          cell: ({ row }) => {
            const participant =
              row.original.participants[row.original.participants.length - 1]

            return <ViewLessonPresence status={participant.presence} />
          },
        }),
        columnHelper.display({
          id: 'homework',
          header: 'Praca domowa',
          cell: ({ row }) => {
            const participant =
              row.original.participants[row.original.participants.length - 1]

            return (
              <ViewLessonHomework
                status={
                  participant.presence !== LessonPresence.Absent
                    ? participant.homework
                    : undefined
                }
              />
            )
          },
        }),
        columnHelper.display({
          id: 'note',
          header: 'Uwagi',
          cell: ({ row }) => (
            <ViewLessonNote
              content={
                row.original.participants[row.original.participants.length - 1]
                  .note
              }
            />
          ),
        }),
        durationColumn,
      ]
    }
  }, [currentRole])

  if (error) {
    return <ErrorAlert message={'Wystąpił błąd podczas pobierania danych'} />
  }

  const filtersActive =
    Boolean(dateFromFilter) ||
    Boolean(dateToFilter) ||
    Boolean(teacherFilter) ||
    Boolean(groupFilter) ||
    (Boolean(studentFilter) && currentRole !== UserRoles.Parent)

  return (
    <IntegratedTable
      loading={isValidating}
      data={data}
      columns={columns}
      sorting={sorting}
      pagination={pagination}
      onChangeSort={setSorting}
      onChangePagination={setPagination}
      extras={
        <Group spacing={'md'}>
          <LessonsStudent
            currentRole={currentRole}
            studentFilter={studentFilter}
            onStudentFilterChange={setStudentFilter}
          />
          <TableFilters
            active={filtersActive}
            onReset={() => {
              setDateFromTo([null, null])
              setTeacherFilter(null)
              setGroupFilter(null)
              if (currentRole !== UserRoles.Parent) {
                setStudentFilter(null)
              }
            }}
          >
            <LessonsFilters
              currentRole={currentRole}
              dateFromTo={dateFromTo}
              onDateFromToChange={setDateFromTo}
              teacherFilter={teacherFilter}
              onTeacherFilterChange={setTeacherFilter}
              groupFilter={groupFilter}
              onGroupFilterChange={(value) => {
                setStudentFilter(null)
                setGroupFilter(value)
              }}
              studentFilter={studentFilter}
              onStudentFilterChange={(value) => {
                setGroupFilter(null)
                setStudentFilter(value)
              }}
            />
          </TableFilters>
          <LessonsExportButton currentRole={currentRole} />
        </Group>
      }
    />
  )
}

const ShowTarget = ({ lesson }: { lesson: LessonWithUsers }) => {
  if (!lesson.group && !lesson.student) {
    return null
  }

  let label = lesson.student?.name ?? lesson.group?.name
  let role = lesson.student ? (
    <>
      <IconUser size={10} stroke={1} /> Uczeń
    </>
  ) : (
    <>
      <IconUsers size={10} stroke={1} /> Grupa
    </>
  )

  return (
    <>
      <Text size={'sm'} weight={500}>
        {label}
      </Text>
      <Text color={'dimmed'} size={'xs'}>
        {role}
      </Text>
    </>
  )
}

const ShowTeacher = ({ name }: { name?: string }) => {
  if (!name) {
    return null
  }

  return (
    <Text size={'sm'} weight={500}>
      {name}
    </Text>
  )
}

const ShowLessonDuration = ({ duration }: { duration: number }) => {
  return (
    <Text size={'sm'} weight={500}>
      {duration} minut
    </Text>
  )
}
