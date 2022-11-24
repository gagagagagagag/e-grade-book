import { useCallback } from 'react'
import { debounce } from 'lodash'
import { useInputState } from '@mantine/hooks'
import { Group, Pagination, ScrollArea, Table, TextInput } from '@mantine/core'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  getPaginationRowModel,
} from '@tanstack/react-table'
import { IconSearch } from '@tabler/icons'

import type { IntegratedTableProps } from './types'
import {
  TableHeader,
  TableHeaderContainer,
  TableSelectHeader,
} from './table-header'
import { TableEmpty } from './table-empty'
import { TableLoading } from './table-loading'
import { TableSelectRow } from './table-row'

export const IntegratedTable = <T,>({
  loading,
  search,
  data,
  columns,
  pagination,
  sorting,
  rowSelection,
  extras,
  onChangePagination,
  onChangeSort,
  onChangeSearch,
  onChangeRowSelection,
}: IntegratedTableProps<T>) => {
  const [localSearch, setLocalSearch] = useInputState(search ?? '')
  const table = useReactTable({
    columns: columns,
    data: data?.data ?? [],
    pageCount: data?.metadata.pageCount ?? -1,
    state: {
      sorting,
      pagination,
    },
    getRowId: useCallback((item: any) => item._id, []),
    onSortingChange: onChangeSort,
    onPaginationChange: onChangePagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    autoResetPageIndex: false,
    getFilteredRowModel: getFilteredRowModel(),
  })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedQuery = useCallback(
    debounce((value: string) => onChangeSearch?.(value), 500, {
      maxWait: 1000,
      trailing: true,
    }),
    []
  )

  const selectionEnabled = !(
    !rowSelection ||
    !onChangeRowSelection ||
    !data?.data
  )
  const numberOfColumns =
    Object.keys(columns).length + (selectionEnabled ? 1 : 0)

  return (
    <>
      <Group position={'apart'} sx={{ flexDirection: 'row-reverse' }} mb={'xl'}>
        <Group spacing={'md'}>{extras}</Group>
        {Boolean(onChangeSearch) && (
          <TextInput
            icon={<IconSearch size={14} stroke={1.5} />}
            placeholder={'Wyszukaj...'}
            autoComplete={'off'}
            value={localSearch}
            onChange={(event) => {
              setLocalSearch(event)
              debouncedQuery(event.target.value)
            }}
          />
        )}
      </Group>
      <ScrollArea>
        <Table
          horizontalSpacing={'md'}
          verticalSpacing={'xs'}
          sx={{ tableLayout: 'fixed', minWidth: 1000 }}
        >
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                <TableSelectHeader
                  data={data?.data}
                  selection={rowSelection}
                  onChangeSelection={onChangeRowSelection}
                />
                {headerGroup.headers.map((header) => (
                  <TableHeaderContainer
                    key={header.id}
                    colSpan={header.colSpan}
                    isActions={header.id === 'actions'}
                  >
                    {header.isPlaceholder ? null : (
                      <TableHeader
                        key={header.id}
                        sortable={header.column.getCanSort()}
                        onSort={header.column.getToggleSortingHandler()}
                        reversed={header.column.getIsSorted() === 'desc'}
                        sorted={Boolean(header.column.getIsSorted())}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </TableHeader>
                    )}
                  </TableHeaderContainer>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <TableLoading columnNumber={numberOfColumns} />
            ) : (data?.data ?? []).length > 0 ? (
              <>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    <TableSelectRow
                      item={row.original}
                      selection={rowSelection}
                      onChange={onChangeRowSelection}
                    />
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            ) : (
              <TableEmpty columnNumber={numberOfColumns} />
            )}
          </tbody>
        </Table>
      </ScrollArea>
      <Group position={'right'} mt={'xl'}>
        <Pagination
          page={table.getState().pagination.pageIndex + 1}
          total={table.getPageCount()}
          onChange={(page) => table.setPageIndex(page - 1)}
        />
      </Group>
    </>
  )
}
