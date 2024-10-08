import { EntityType, Entity } from '../../entity.js'
import { DBLibraryBook } from './libraries-books.interfaces.js'

export class LibraryBookEntity extends Entity<EntityType.LibrariesBooks> {
  readonly libraryId: string
  readonly bookId: string
  readonly bookTitle: string
  readonly bookAuthors: readonly string[]
  readonly userId: string
  readonly addedAt: Date
  readonly updatedAt: Date

  constructor (data: DBLibraryBook) {
    super(EntityType.LibrariesBooks, data._id)
    this.libraryId = data.libraryId
    this.bookId = data.bookId
    this.bookTitle = data.bookTitle
    this.bookAuthors = data.bookAuthors
    this.userId = data.userId
    this.addedAt = data.addedAt
    this.updatedAt = data.updatedAt
  }

  attributes (): Object {
    return {
      libraryId: this.libraryId,
      bookId: this.bookId,
      bookTitle: this.bookTitle,
      bookAuthors: this.bookAuthors,
      userId: this.userId,
      addedAt: this.addedAt,
      updatedAt: this.updatedAt
    }
  }
}
