import { EntityType, Entity } from '../../entity.js'
import { DBAdmin } from './admins.interfaces.js'

export class AdminEntity extends Entity<EntityType.Admins> {
  readonly name: string
  readonly email: string
  readonly createdAt: Date
  readonly updatedAt: Date

  constructor (id: string, data: DBAdmin) {
    super(EntityType.Admins, id)
    this.name = data.name
    this.email = data.email
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
