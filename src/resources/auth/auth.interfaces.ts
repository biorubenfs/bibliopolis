import { z } from 'zod'
import { loginSchema } from './auth.schemas.js'

export type LoginSchema = z.infer<typeof loginSchema>
