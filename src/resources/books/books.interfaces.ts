import { z } from 'zod'
import { BookEntity } from './books.entity.js'
import { newBookSchema } from './books.schema.js'
import { BookCover } from '../../types.js'

export type NewBook = z.infer<typeof newBookSchema>
export interface NewBookDao {
  title: string
  authors: readonly string[]
  isbn13: string
  isbn10: string | null
  cover: BookCover
}

export type DBBook = Omit<BookEntity, 'id' | 'type' | 'attributes' | 'toResult'> & { _id: string }
