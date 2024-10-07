import { EntityType, Entity } from '../../entity.js'
import { DBBook } from './books.interfaces.js'

export class BookEntity extends Entity<EntityType.Books> {
  readonly title: string
  readonly authors: readonly string[]
  readonly isbn_13: string
  readonly cover: string
  readonly createdAt: Date
  readonly updatedAt: Date

  constructor (data: DBBook) {
    super(EntityType.Books, data._id)
    this.title = data.title
    this.authors = data.authors
    this.isbn_13 = data.isbn_13
    this.cover = data.cover
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }

  attributes (): Object {
    return {
      title: this.title,
      authors: this.authors,
      isbn_13: this.isbn_13,
      cover: this.cover,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }
}
