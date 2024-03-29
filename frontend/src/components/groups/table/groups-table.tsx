import { useState, useMemo } from 'react'
import { Group, Text } from '@mantine/core'
import {
  SortingState,
  PaginationState,
  createColumnHelper,
} from '@tanstack/react-table'

import { IntegratedTable, useTableSelection } from '../../table'
import { CreateGroupButton } from '../data/group-modals'
import { PopulatedUser } from '../../users/types'
import { ErrorAlert } from '../../ui'
import { useCombineGroupStudentNames, useGetGroups } from '../hooks'
import { GroupWithStudents } from '../types'
import { GroupsTableSelection } from './types'
import { GroupsActions } from './groups-actions'
import { SelectionIndicator } from './selection-indicator'

export const GroupsTable = () => {
  const [q, setQ] = useState('')
  const { selection, selectionHandler, clearSelectionHandler } =
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
  const { error, isValidating, data, mutate } = useGetGroups({
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
    const columnHelper = createColumnHelper<GroupWithStudents>()

    return [
      columnHelper.accessor('name', {
        id: 'name',
        header: 'Nazwa',
        cell: ({ getValue }) => (
          <Text weight={500} size={'sm'}>
            {getValue()}
          </Text>
        ),
      }),
      columnHelper.accessor('students', {
        id: 'students',
        header: 'Uczniowie',
        cell: ({ getValue }) => <ShowStudents students={getValue() ?? []} />,
      }),
      columnHelper.display({
        id: 'actions',
        cell: ({ row }) => (
          <GroupsActions
            group={row.original}
            onEdit={(updatedGroup) => {
              mutate((data) => {
                if (!data) {
                  return data
                }

                return {
                  ...data,
                  data: data.data.map((group) => {
                    if (group._id !== updatedGroup._id) {
                      return group
                    }
                    return updatedGroup
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
    <IntegratedTable<GroupWithStudents>
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
          <CreateGroupButton
            onCreated={() => {
              mutate()
            }}
          />
        </Group>
      }
    />
  )
}

const ShowStudents = ({ students }: { students: PopulatedUser[] }) => {
  const combineStudentNames = useCombineGroupStudentNames()

  const combinedNames = combineStudentNames(students)

  return (
    <Text size={'sm'} weight={400}>
      {combinedNames ? combinedNames : 'Brak'}
    </Text>
  )
}
