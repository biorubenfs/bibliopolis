import { EntityType, Entity } from '../../entity.js'
import { DBUser } from './users.dao.js'

export class UserEntity extends Entity<EntityType.Users> {
  readonly name: string
  readonly email: string
  readonly password: string
  readonly createdAt: Date
  readonly updatedAt: Date

  constructor (id: string, data: DBUser) {
    super(EntityType.Users, id)
    this.name = data.name
    this.email = data.email
    this.password = data.password
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }

  attributes (): Object {
    return {
      name: this.name,
      email: this.email,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }
}
