import { z } from 'zod'

export const newLibrarySchema = z.object({
  name: z.string(),
  description: z.string()
})

export const bookIdSchema = z.object({ id: z.string() })
export const bookIsbnSchema = z.object({ isbn: z.string() })
