import { useCallback, useMemo, useState } from 'react'
import { Text, Group } from '@mantine/core'
import {
  createColumnHelper,
  PaginationState,
  SortingState,
} from '@tanstack/react-table'
import { DateTime } from 'luxon'

import { IntegratedTable, TableFilters, useTableSelection } from '../../table'
import { ErrorAlert } from '../../ui'
import { useGetUsers } from '../hooks'
import { User, UserRoles } from '../types'
import { UserBadge } from '../badges'
import { UsersTableSelection } from './types'
import { SelectionIndicator } from './selection-indicator'
import { UsersFilters } from './users-filters'
import { UsersActions } from './users-actions'
import { CreateUserButton } from '../data/user-modals'

export const UsersTable = () => {
  const [roleFilter, setRoleFilter] = useState<UserRoles | undefined>(undefined)
  const [q, setQ] = useState('')
  const { selection, selectionHandler, clearSelectionHandler } =
    useTableSelection<UsersTableSelection>(
      useCallback(
        (item: UsersTableSelection) => ({ _id: item._id, role: item.role }),
        []
      )
    )
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
  const { data, isValidating, error, mutate } = useGetUsers({
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
        cell: ({ row }) => (
          <UsersActions
            user={row.original}
            onEdit={(updatedUser: User) => {
              mutate((data) => {
                if (!data) {
                  return data
                }

                return {
                  ...data,
                  data: data.data.map((user) => {
                    if (user._id !== updatedUser._id) {
                      return user
                    } else {
                      return updatedUser
                    }
                  }),
                }
              })
            }}
          />
        ),
      }),
    ]
  }, [mutate])

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
        onChangeRowSelection={selectionHandler}
        extras={
          <Group spacing={'md'}>
            <SelectionIndicator
              selection={selection}
              clearSelection={clearSelectionHandler}
            />
            <TableFilters
              active={Boolean(roleFilter)}
              onReset={() => setRoleFilter(undefined)}
            >
              <UsersFilters
                role={roleFilter}
                onRoleChange={(value) => {
                  setRoleFilter(value)
                  clearSelectionHandler()
                }}
              />
            </TableFilters>
            <CreateUserButton onCreated={() => mutate()} />
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
