export interface PaginationQuery {
  page?: number
  perPage?: number
  q?: string
  sortField?: string
  sortDirection?: string
}

export interface PaginationResponse<T> {
  data: T[]
  metadata: {
    page: number
    perPage: number
    pageCount: number
    totalCount: number
  }
}
