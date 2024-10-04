import { z } from 'zod'
import { createUserSchema } from './users.schemas.js'

export type CreateUser = z.infer<typeof createUserSchema>
