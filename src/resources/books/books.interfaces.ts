import { z } from 'zod'
import { BookEntity } from './books.entity.js'
import { newBookSchema } from './books.schema.js'

export type NewBook = z.infer<typeof newBookSchema>
export interface NewBookDao {
  title: string
  authors: readonly string[]
  isbn_13: string
  isbn_10: string
  cover: number | null
}

export type DBBook = Omit<BookEntity, 'id' | 'type' | 'attributes' | 'toResult'> & { _id: string }
