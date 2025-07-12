interface WorkAuthor {
    author: Key;
    type:   Key;
}

interface Key {
    key: string;
}

export interface OpenLibraryBook {
  title: string
  works: Array<{key: string}>
  isbn_13?: string[]
  covers?: number[]
}

export interface OpenLibraryWork {
  authors: Array<WorkAuthor>
}

export interface OpenLibraryAuthor {
  name: string
  personal_name: string
}
