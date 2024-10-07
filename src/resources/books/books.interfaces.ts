import { z } from 'zod'
import { BookEntity } from './books.entity.js'
import { newBookSchema } from './books.schema.js'

export type NewBook = z.infer<typeof newBookSchema>
export type DBBook = Omit<BookEntity, 'id' | 'type' | 'attributes' | 'toResult'> & { _id: string }
