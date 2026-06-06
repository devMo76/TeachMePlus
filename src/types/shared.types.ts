export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResult<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
}

export interface SelectOption {
  value: string
  label: string
}
