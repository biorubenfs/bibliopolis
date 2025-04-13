export interface OpenLibraryBook {
  title: string
  authors: Array<{ key: string }>
  isbn_10?: string[]
  isbn_13?: string[]
  covers?: number[]
}

export interface Author {
  personal_name: string
}
