import { useMemo, useState } from 'react'
import { differenceBy, uniqBy } from 'lodash'
import { Text, Group } from '@mantine/core'
import {
  createColumnHelper,
  PaginationState,
  SortingState,
} from '@tanstack/react-table'
import { DateTime } from 'luxon'

import { IntegratedTableSelectionHandler } from '../../table/types'
import { IntegratedTable } from '../../table/integrated-table'
import { ErrorAlert } from '../../ui'
import { useGetUsers } from '../hooks'
import { User, UserRoles } from '../types'
import { UserBadge } from '../badges'
import { UsersTableSelection } from './types'
import { SelectionIndicator } from './selection-indicator'
import { UsersFilters } from './users-filters'
import { UsersActions } from './users-actions'
import { TableFilters } from '../../table/table-filters'

export interface UsersTableProps {}

export const UsersTable = () => {
  const [roleFilter, setRoleFilter] = useState<UserRoles | undefined>(undefined)
  const [q, setQ] = useState('')
  const [selection, setSelection] = useState<UsersTableSelection[]>([])
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
  const { data, isValidating, error } = useGetUsers({
    q,
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
    sortField: sorting.length ? sorting[0].id : undefined,
    sortDirection: sorting.length
      ? sorting[0].desc
        ? 'desc'
        : 'asc'
      : undefined,
    role: roleFilter,
  })

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<User>()

    return [
      columnHelper.accessor('name', {
        id: 'name',
        header: 'Imię i nazwisko',
        cell: ({ getValue }) => (
          <Text size={'sm'} weight={500}>
            {getValue()}
          </Text>
        ),
      }),
      columnHelper.accessor('role', {
        id: 'role',
        header: 'Rola',
        cell: ({ getValue }) => <UserBadge role={getValue()} />,
      }),
      columnHelper.accessor('email', {
        id: 'email',
        header: 'Email',
      }),
      columnHelper.accessor('lastLogin', {
        id: 'lastLogin',
        header: 'Ostatnie logowanie',
        cell: ({ getValue }) => <ShowLastLogin lastLogin={getValue()} />,
      }),
      columnHelper.display({
        id: 'actions',
        cell: ({ row }) => <UsersActions user={row.original} />,
      }),
    ]
  }, [])

  const changeRowSelectionHandler: IntegratedTableSelectionHandler<User> = (
    items,
    mode
  ) => {
    setSelection((prev) => {
      const mappedItems = items.map((item) => ({
        _id: item._id,
        role: item.role,
      }))
      const newState =
        mode === 'add'
          ? uniqBy([...mappedItems, ...prev], '_id')
          : differenceBy(prev, mappedItems, '_id')

      return newState
    })
  }

  if (error) {
    return <ErrorAlert message={'Wystąpił błąd podczas pobierania danych'} />
  }

  return (
    <>
      <IntegratedTable<User>
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
        onChangeRowSelection={changeRowSelectionHandler}
        extras={
          <Group spacing={'md'}>
            <SelectionIndicator
              selection={selection}
              clearSelection={() => setSelection([])}
            />
            <TableFilters
              active={Boolean(roleFilter)}
              onReset={() => setRoleFilter(undefined)}
            >
              <UsersFilters
                role={roleFilter}
                onRoleChange={(value) => {
                  setRoleFilter(value)
                  setSelection([])
                }}
              />
            </TableFilters>
          </Group>
        }
      />
    </>
  )
}

const ShowLastLogin = ({ lastLogin }: { lastLogin?: string }) => {
  if (!lastLogin) {
    return null
  }

  const formattedLastLogin = DateTime.fromISO(lastLogin)
    .setLocale('pl')
    .toRelative()

  return <Text size={'sm'}>{formattedLastLogin}</Text>
}
