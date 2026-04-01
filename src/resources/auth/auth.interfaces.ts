import { z } from 'zod'
import { loginSchema } from './auth.schemas.js'

export type Login = z.infer<typeof loginSchema>

export interface DBRefreshToken {
  _id: string
  tokenHash: string
  userId: string
  expiresAt: Date
  createdAt: Date
  revokedAt: Date | null
}
