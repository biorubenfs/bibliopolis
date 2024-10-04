import { Entity, EntityType, ResultMiscObject } from './entity.js'
import { PaginationObject } from './types.js'

abstract class ResultObject {
  readonly paginationInfo?: PaginationObject

  constructor (paginationInfo?: PaginationObject) {
    this.paginationInfo = paginationInfo
  }
}

export class SingleResultObject extends ResultObject {
  readonly entity: Entity<EntityType>

  constructor (entity: Entity<EntityType>) {
    super()
    this.entity = entity
  }
}

export class CollectionResultObject extends ResultObject {
  readonly entities: ReadonlyArray<Entity<EntityType>>

  constructor (entities: ReadonlyArray<Entity<EntityType>>, paginationInfo: PaginationObject) {
    super(paginationInfo)
    this.entities = entities
  }
}

export class MiscResultObject extends ResultObject {
  readonly attributes: object

  constructor (attributes: object) {
    super()
    this.attributes = attributes
  }

  toResult (): ResultMiscObject {
    return {
      type: 'auth-response',
      attributes: this.attributes
    }
  }
}
