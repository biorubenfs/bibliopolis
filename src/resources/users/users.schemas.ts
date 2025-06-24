import { z } from 'zod'

export const createUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string()
})

export const updatePasswordSchema = z.object({
  currentPassword: z.string().max(20),
  newPassword: z.string().max(20)
})
