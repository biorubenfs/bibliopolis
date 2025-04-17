import z from 'zod'

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  name: z.string()
})

export const loginSchema = signupSchema.omit({ name: true })
