import { userBookUpdateSchema } from '../libraries/libraries.schemas'
import { UserBookEntity } from './user-books.entity'
import z from 'zod'

// export type UserBookRating = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export enum UserBookRating {
  ONE = 1,
  TWO,
  THREE,
  FOUR,
  FIVE,
  SIX,
  SEVEN,
  EIGHT,
  NINE,
  TEN,
}

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

export type UpdateUserBook = z.infer<typeof userBookUpdateSchema>
