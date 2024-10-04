import { Entity, EntityType } from './entity.js'
import { PaginationObject } from './types.js'

abstract class ResultObject {
  readonly paginationInfo?: PaginationObject

  constructor (paginationInfo?: PaginationObject) {
    this.paginationInfo = paginationInfo
  }
}

export class SingleResultObject extends ResultObject {
  results: Entity<EntityType>

  constructor (entity: Entity<EntityType>) {
    super()
    this.results = entity
  }
}

export class CollectionResultObject extends ResultObject {
  results: ReadonlyArray<Entity<EntityType>>

  constructor (entities: ReadonlyArray<Entity<EntityType>>, paginationInfo: PaginationObject) {
    super(paginationInfo)
    this.results = entities
  }
}
