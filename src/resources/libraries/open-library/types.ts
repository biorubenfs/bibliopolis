export interface Type {
  key: string
}

export interface Edition {
  title: string
  authors: Type[]
  isbn_10: string[]
  isbn_13: string[]
  covers: number[]
}

export interface Author {
  personal_name: string
}
