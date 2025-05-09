import { UserEntity } from './users.entity.js'

export type CreateUser = Pick<UserEntity, 'name' | 'email' | 'password' | 'validationCode'>
export type DBUser = Omit<UserEntity, 'id' | 'type' | 'attributes' | 'toResult'> & { _id: string }
export enum Role {
  Regular = 'regular',
  Admin = 'admin'
}
