import { LibraryBookEntity } from './libraries-books.entity'

export type DBLibraryBook = Omit<LibraryBookEntity, 'id' | 'type' | 'attributes' | 'toResult'> & { _id: string }
export interface NewLibraryBook {
  libraryId: string
  bookId: string
  bookTitle: string
  bookAuthors: readonly string[]
  userId: string
}
