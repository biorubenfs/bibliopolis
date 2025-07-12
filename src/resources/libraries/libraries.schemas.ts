import { z } from 'zod'
import { UserBookRating } from '../user-books/user-books.interfaces.js'

export const newLibrarySchema = z.object({
  name: z.string(),
  description: z.string()
})

export const bookIsbnSchema = z.object({ isbn: z.string() })
