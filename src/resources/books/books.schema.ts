import { z } from 'zod'

export const newBookSchema = z
  .object({
    title: z.string(),
    authors: z.array(z.string()),
    isbn_13: z.string().max(13).nullable().optional().default(null),
    isbn_10: z.string().max(10).nullable().optional().default(null),
    cover: z.number().nullable()
  })
  .refine(
    (data) => data.isbn_13 !== null || data.isbn_10 !== null,
    {
      message: 'Either isbn_13 or isbn_10 must be provided',
      path: ['isbn_13']
    }
  )
