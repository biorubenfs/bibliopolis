import { z } from 'zod'

export const newLibrarySchema = z.object({
  name: z.string(),
  description: z.string()
})

export const bookdIdSchema = z.object({ id: z.string() }) // could represent a id of bibliopolis or a open library edition id
