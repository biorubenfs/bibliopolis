import { EntityType, Entity } from '../../entity.js'
import { DBUser, Role } from './users.interfaces.js'

export class UserEntity extends Entity<EntityType.Users> {
  readonly name: string
  readonly email: string
  readonly password: string
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly role: Role

  constructor (data: DBUser) {
    super(EntityType.Users, data._id)
    this.name = data.name
    this.email = data.email
    this.password = data.password
    this.role = data.role
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }

  attributes (): Object {
    return {
      name: this.name,
      email: this.email,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      password: this.password
    }
  }
}
