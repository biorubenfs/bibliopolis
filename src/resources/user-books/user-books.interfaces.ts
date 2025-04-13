import { UserBookEntity } from './user-books.entity'

export type UserBooksRating = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export type DBUserBook = Omit<UserBookEntity, 'id' | 'type' | 'attributes' | 'toResult'> & { _id: string }

export interface NewUserBook {
  libraryId: string
  bookId: string
  bookTitle: string
  bookAuthors: readonly string[]
  bookCover: null | number
  rating: null
  notes: null
  userId: string
}
