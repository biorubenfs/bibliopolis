export interface Page {
  limit: number
  skip: number
}

export interface PaginationObject {
  page: Page
  total: number
}

export enum HttpStatusCode {
  Created = 201,
  OK = 200,
  NoContent = 204
}
