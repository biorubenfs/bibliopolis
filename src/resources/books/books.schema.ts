import { z } from 'zod'
import { BooksSource } from '../sources/sources.types.js'
import { ISBNUtils } from '../../utils/isbn.utils.js'

export const newBookSchema = z
  .object({
    title: z.string(),
    authors: z.array(z.string()),
    isbn13: z.string().trim().transform((val) => val.replace(/[-\s]/g, '')).nullable().optional().default(null),
    isbn10: z.string().trim().transform((val) => val.replace(/[-\s]/g, '')).nullable().optional().default(null),
    cover: z.object({
      source: z.nativeEnum(BooksSource).nullable(),
      value: z.string().nullable()
    })
  })
  .refine(
    (data) => data.isbn13 !== null || data.isbn10 !== null,
    {
      message: 'Either isbn13 or isbn10 must be provided',
      path: ['isbn13']
    }
  )
  .refine((data) => {
    if (data.isbn13 != null && !ISBNUtils.isValidIsbn13(data.isbn13)) {
      return false
    }
    return true
  }, {
    message: 'isbn13 must be a valid ISBN-13',
    path: ['isbn13']
  })
  .refine((data) => {
    if (data.isbn10 != null && !ISBNUtils.isValidIsbn10(data.isbn10)) {
      return false
    }
    return true
  }, {
    message: 'isbn10 must be a valid ISBN-10',
    path: ['isbn10']
  })
  .refine((data) => {
    if (data.isbn13 != null && data.isbn10 != null) {
      const calculatedIsbns = ISBNUtils.calculateIsbns(data.isbn10, data.isbn13)
      return calculatedIsbns.isbn13 === data.isbn13 && calculatedIsbns.isbn10 === data.isbn10
    }
    return true
  }, {
    message: 'isbn13 and isbn10 do not correspond to the same book',
    path: ['isbn13', 'isbn10']
  })
