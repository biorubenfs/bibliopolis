import { z } from 'zod'
import { BooksSource } from '../sources/sources.types.js'

export const newLibrarySchema = z.object({
  name: z.string(),
  description: z.string().trim()
})

export const addBookToLibrarySchema = z.object({
  title: z.string(),
  isbn13: z.string().nullable(),
  isbn10: z.string().nullable(),
  authors: z.array(z.string()).default([]),
  cover: z.object({
    source: z.nativeEnum(BooksSource).nullable(),
    value: z.string().nullable()
  }).default({ source: null, value: null })
})

export const bookIsbnSchema = z.object({ isbn: z.string() })
