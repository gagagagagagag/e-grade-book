import React from 'react'
import { PaginationState, SortingState } from '@tanstack/react-table'

import { PaginationResponse } from '../data'

export type IntegratedTableSelection = IntegratedTableSelectionItem[]

export interface IntegratedTableSelectionItem {
  _id: string
}

export type IntegratedTableSelectionHandler<T> = (
  items: T[],
  mode: 'add' | 'remove'
) => void

export interface IntegratedTableProps<T> {
  loading: boolean
  search?: string
  data?: PaginationResponse<T>
  rowSelection?: IntegratedTableSelection
  columns: any[]
  pagination: PaginationState
  sorting: SortingState
  extras?: React.ReactNode
  onChangeSearch?: React.Dispatch<React.SetStateAction<string>>
  onChangeRowSelection?: IntegratedTableSelectionHandler<T>
  onChangePagination: React.Dispatch<React.SetStateAction<PaginationState>>
  onChangeSort: React.Dispatch<React.SetStateAction<SortingState>>
}

export type TableFiltersProps = {
  active: boolean
  onReset: () => void
  children: React.ReactNode
}
