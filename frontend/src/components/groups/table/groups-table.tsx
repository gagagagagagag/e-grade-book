import { useState, useMemo } from 'react'
import { Group } from '@mantine/core'
import {
  SortingState,
  PaginationState,
  createColumnHelper,
} from '@tanstack/react-table'

import { IntegratedTable, useTableSelection } from '../../table'
import { ErrorAlert } from '../../ui'
import { useGetGroups } from '../hooks'
import { Group as GroupType } from '../types'
import { GroupsTableSelection } from './types'

export const GroupsTable = () => {
  const [q, setQ] = useState('')
  const { selection, selectionHandler } =
    useTableSelection<GroupsTableSelection>()
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'name',
      desc: false,
    },
  ])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  })
  const { error, isValidating, data } = useGetGroups({
    q,
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
    const columnHelper = createColumnHelper<GroupType>()

    return [
      columnHelper.accessor('name', {
        id: 'name',
      }),
      columnHelper.accessor('students', {
        id: 'students',
      }),
    ]
  }, [])

  if (error) {
    return <ErrorAlert message={'Wystąpił błąd podczas pobierania danych'} />
  }

  return (
    <IntegratedTable
      loading={isValidating}
      search={q}
      data={data}
      columns={columns}
      sorting={sorting}
      pagination={pagination}
      rowSelection={selection}
      onChangeSort={setSorting}
      onChangePagination={setPagination}
      onChangeSearch={setQ}
      onChangeRowSelection={selectionHandler}
      extras={<Group spacing={'md'}></Group>}
    />
  )
}
