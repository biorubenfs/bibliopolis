import { CookieOptions } from 'express'
import { Entity, EntityType, ResultMiscObject } from './entity.js'
import { PaginationObject } from './types.js'

export class SingleResultObject<T extends Entity<EntityType>> {
  readonly entity: T

  constructor (entity: T) {
    this.entity = entity
  }
}

export class CollectionResultObject<T extends Entity<EntityType>> {
  readonly entities: readonly T[]
  readonly paginationInfo: PaginationObject

  constructor (entities: readonly T[], paginationInfo: PaginationObject) {
    this.paginationInfo = paginationInfo
    this.entities = entities
  }
}

export class MiscResultObject {
  readonly attributes: object
  readonly name: string

  constructor (name: string = 'misc', attributes: object) {
    this.name = name
    this.attributes = attributes
  }

  toResult (): ResultMiscObject {
    return {
      type: this.name,
      attributes: this.attributes
    }
  }
}

export class SetCookieResultObject<T extends Entity<EntityType>> {
  readonly name: string
  readonly value: string
  readonly options: CookieOptions
  readonly entity: T

  constructor (name: string, value: string, options: CookieOptions, entity: T) {
    this.name = name
    this.value = value
    this.options = options
    this.entity = entity
  }
}

export class ClearCookieResultObject {
  readonly name: string
  readonly options: CookieOptions

  constructor (name: string, options: CookieOptions) {
    this.name = name
    this.options = options
  }
}

export class RedirectResultObject {
  readonly url: URL

  constructor (url: string) {
    this.url = new URL(url)
  }
}

export class TokenResultObject {
  readonly accessToken: string
  readonly refreshTokenCookie: {
    name: string
    value: string
    options: CookieOptions
  }

  constructor (accessToken: string, refreshToken: string, refreshTokenOptions: CookieOptions) {
    this.accessToken = accessToken
    this.refreshTokenCookie = {
      name: 'refresh_token',
      value: refreshToken,
      options: refreshTokenOptions
    }
  }
}
