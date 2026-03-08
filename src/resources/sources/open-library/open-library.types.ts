interface WorkAuthor {
  author: Key
  type: Key
}

interface Key {
  key: string
}

export interface OpenLibraryBook {
  title: string
  works: Array<{ key: string }>
  isbn_13?: string[]
  isbn_10?: string[]
  covers?: number[]
}

export interface OpenLibraryWork {
  authors: WorkAuthor[]
}

export interface OpenLibraryAuthor {
  name: string
  personal_name: string
}
