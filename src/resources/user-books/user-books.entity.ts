import { EntityType, Entity } from '../../entity.js'
import { getCoverUrl } from '../../utils.js'
import { DBUserBook, UserBooksRating } from './user-books.interfaces.js'

export class UserBookEntity extends Entity<EntityType.UserBooks> {
  readonly libraryId: string
  readonly bookId: string
  readonly bookTitle: string
  readonly bookAuthors: readonly string[]
  readonly bookCover: null | string
  readonly bookRating: null | UserBooksRating
  readonly bookNotes: null | string
  readonly userId: string
  readonly createdAt: Date
  readonly updatedAt: Date

  constructor (data: DBUserBook) {
    super(EntityType.UserBooks, data._id)
    this.libraryId = data.libraryId
    this.bookId = data.bookId
    this.bookTitle = data.bookTitle
    this.bookAuthors = data.bookAuthors
    this.bookCover = data.bookCover
    this.bookRating = data.bookRating
    this.bookNotes = data.bookNotes
    this.userId = data.userId
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }

  attributes (): Object {
    return {
      libraryId: this.libraryId,
      bookId: this.bookId,
      bookTitle: this.bookTitle,
      bookAuthors: this.bookAuthors,
      bookCoverUrl: getCoverUrl(this.bookCover),
      bookRating: this.bookRating,
      bookNotes: this.bookNotes,
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }
}
