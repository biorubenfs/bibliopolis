import { Entity, EntityType, ResultMiscObject } from './entity.js'
import { HttpStatusCode, PaginationObject } from './types.js'

// eslint-disable-next-line
export abstract class ResultObject {
  static toFinal<T> (status: HttpStatusCode, data: T): { status: HttpStatusCode, data: T } {
    return {
      status,
      data
    }
  }
}

export class SingleResultObject<T extends Entity<EntityType>> extends ResultObject {
  readonly entity: T

  constructor (entity: T) {
    super()
    this.entity = entity
  }
}

export class CollectionResultObject<T extends Entity<EntityType>> extends ResultObject {
  readonly entities: readonly T[]
  readonly paginationInfo: PaginationObject

  constructor (entities: readonly T[], paginationInfo: PaginationObject) {
    super()
    this.paginationInfo = paginationInfo
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
