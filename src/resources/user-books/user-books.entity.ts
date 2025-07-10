import { EntityType, Entity } from '../../entity.js'
import { getCoverUrl } from '../../utils.js'
import { DBUserBook, UserBookRating } from './user-books.interfaces.js'

export class UserBookEntity extends Entity<EntityType.UserBooks> {
  readonly libraries: readonly string[]
  readonly bookId: string
  readonly bookTitle: string
  readonly bookAuthors: readonly string[]
  readonly bookCover: null | number
  readonly bookIsbn: SVGStringList
  readonly rating: null | UserBookRating
  readonly notes: null | string
  readonly userId: string
  readonly createdAt: Date
  readonly updatedAt: Date

  constructor (data: DBUserBook) {
    super(EntityType.UserBooks, data._id)
    this.libraries = data.libraries
    this.bookId = data.bookId
    this.bookTitle = data.bookTitle
    this.bookAuthors = data.bookAuthors
    this.bookCover = data.bookCover
    this.bookIsbn = data.bookIsbn
    this.rating = data.rating
    this.notes = data.notes
    this.userId = data.userId
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }

  attributes (): Object {
    return {
      libraries: this.libraries,
      bookId: this.bookId,
      bookTitle: this.bookTitle,
      bookAuthors: this.bookAuthors,
      bookCoverUrl: getCoverUrl(this.bookCover),
      bookIsbn: this.bookIsbn,
      rating: this.rating,
      notes: this.notes,
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }
}
