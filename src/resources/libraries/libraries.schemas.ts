import { z } from 'zod'
import { UserBookRating } from '../user-books/user-books.interfaces.js'

export const newLibrarySchema = z.object({
  name: z.string(),
  description: z.string()
})

export const bookIdSchema = z.object({ id: z.string() })
export const bookIsbnSchema = z.object({ isbn: z.string() })

export const userBookUpdateSchema = z.object({
  // rating: z.union([
  //   z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5),
  //   z.literal(6), z.literal(7), z.literal(8), z.literal(9), z.literal(10),
  // ]).nullable(),
  rating: z.nativeEnum(UserBookRating).nullable(),
  notes: z.string().nullable()
})
