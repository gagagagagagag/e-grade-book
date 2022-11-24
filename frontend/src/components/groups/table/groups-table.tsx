import { useState, useMemo } from 'react'
import { Badge, Group, Text } from '@mantine/core'
import {
  SortingState,
  PaginationState,
  createColumnHelper,
} from '@tanstack/react-table'
import { IconUser } from '@tabler/icons'

import { IntegratedTable, useTableSelection } from '../../table'
import { CreateGroupButton } from '../data/group-modals'
import { ErrorAlert } from '../../ui'
import { useGetGroups } from '../hooks'
import { Group as GroupType, GroupStudent, GroupWithStudents } from '../types'
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
    const columnHelper = createColumnHelper<GroupType>()

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
        cell: ({ getValue }) => (
          <ShowStudents
            students={(getValue() as unknown as GroupStudent[]) ?? []}
          />
        ),
      }),
    ]
  }, [])

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

const ShowStudents = ({ students }: { students: GroupStudent[] }) => {
  return (
    <Group>
      {students.map((student) => (
        <Badge key={student._id}>
          <Group align={'center'} spacing={'xs'}>
            <IconUser size={14} stroke={1} />
            <Text size={'xs'}>{student.name}</Text>
          </Group>
        </Badge>
      ))}
    </Group>
  )
}
