import { useState, useMemo } from 'react'
import { Group } from '@mantine/core'
import {
  createColumnHelper,
  PaginationState,
  SortingState,
} from '@tanstack/react-table'

import { IntegratedTable } from '../../table'
import { ErrorAlert } from '../../ui'
import { useGetLessons } from '../hooks'
import { Lesson } from '../types'
import { LessonsActions } from './lessons-actions'

export const LessonsTable = () => {
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
    const columnHelper = createColumnHelper<Lesson>()

    return [
      columnHelper.accessor('date', {
        id: 'date',
      }),
      columnHelper.accessor('duration', {
        id: 'duration',
      }),
      columnHelper.display({
        id: 'actions',
        cell: ({ row }) => <LessonsActions lesson={row.original} />,
      }),
    ]
  }, [])

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
