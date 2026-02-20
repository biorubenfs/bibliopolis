import { z } from 'zod'

export const newBookSchema = z
  .object({
    title: z.string(),
    authors: z.array(z.string()),
    isbn13: z.string().max(13).nullable().optional().default(null),
    isbn10: z.string().max(10).nullable().optional().default(null),
    cover: z.number().nullable()
  })
  .refine(
    (data) => data.isbn13 !== null || data.isbn10 !== null,
    {
      message: 'Either isbn13 or isbn10 must be provided',
      path: ['isbn13']
    }
  )
