import { useState, useMemo } from 'react'
import { DateTime } from 'luxon'
import { Group, Text } from '@mantine/core'
import {
  createColumnHelper,
  PaginationState,
  SortingState,
} from '@tanstack/react-table'
import { IconUser, IconUsers } from '@tabler/icons'

import { useCurrentRole } from '../../auth/hooks'
import { IntegratedTable } from '../../table'
import { UserRoles } from '../../users/types'
import { ErrorAlert } from '../../ui'
import { useGetLessons } from '../hooks'
import { LessonWithUsers } from '../types'
import { LessonsActions } from './lessons-actions'

export const LessonsTable = () => {
  const currentRole = useCurrentRole()
  const [sorting, setSorting] = useState<SortingState>([])
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
    }

    return []
  }, [currentRole])

  if (error) {
    return <ErrorAlert message={'Wystąpił błąd podczas pobierania danych'} />
  }

  return (
    <IntegratedTable
      loading={isValidating}
      data={data}
      columns={columns}
      sorting={sorting}
      pagination={pagination}
      onChangeSort={setSorting}
      onChangePagination={setPagination}
      extras={<Group spacing={'md'}></Group>}
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
