import { z } from 'zod'

export const newBookSchema = z.object({
  title: z.string(),
  authors: z.array(z.string()),
  isbn_13: z.string().max(13),
  cover: z.string()
})
