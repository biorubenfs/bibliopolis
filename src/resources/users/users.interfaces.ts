import { z } from 'zod'
import { createUserSchema, updateUserSchema } from './users.schemas.js'
import { UserEntity } from './users.entity.js'

export type CreateUser = z.infer<typeof createUserSchema>
export type DBUser = Omit<UserEntity, 'id' | 'type' | 'attributes' | 'toResult'> & { _id: string }
export enum Role {
  Regular = 'regular',
  Admin = 'admin'
}

export type UpdateUser = z.infer<typeof updateUserSchema>
