export interface Page {
  limit: number
  skip: number
}

export interface PaginationObject {
  page: Page
  total: number
}
