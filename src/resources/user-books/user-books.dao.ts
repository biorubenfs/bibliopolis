import { ulid } from 'ulid'
import Dao from '../../dao.js'
import { isNotNull } from '../../utils.js'
import { DBUserBook, UpdateUserBook } from './user-books.interfaces.js'
import { UserBookEntity } from './user-books.entity.js'
import { ClientSession } from 'mongodb'
import { BookEntity } from '../books/books.entity.js'

function dbUserBookToEntity (dbUserBook: DBUserBook | null): UserBookEntity | null {
  return dbUserBook == null ? null : new UserBookEntity(dbUserBook)
}

class UserBooksDao extends Dao<DBUserBook> {
  constructor () {
    super('user_books')
  }

  async findById (id: string): Promise<UserBookEntity | null> {
    const userBook = await this.collection.findOne({ _id: id })

    return dbUserBookToEntity(userBook)
  }

  async upsert (libraryId: string, userId: string, book: BookEntity, session: ClientSession): Promise<UserBookEntity | null> {
    const userBook = await this.collection.findOneAndUpdate(
      { userId, bookId: book.id },
      {
        $setOnInsert: {
          _id: ulid(),
          bookTitle: book.title,
          bookAuthors: book.authors,
          bookCover: book.cover,
          bookIsbn13: book.isbn13,
          bookIsbn10: book.isbn10,
          rating: null,
          notes: null
        },
        $push: { libraries: libraryId } // or $addToSet if we want to avoid duplicates, although we control this situation on libraries service)
      },
      { upsert: true, session, returnDocument: 'after' } // options
    )

    return dbUserBookToEntity(userBook)
  }

  async delete (libraryId: string, userBookId: string, userId: string, session: ClientSession): Promise<void> {
    await this.collection.updateOne(
      {
        _id: userBookId,
        libraries: libraryId,
        userId
      },
      { $pull: { libraries: libraryId } },
      { session })
  }

  async list (filters: {librariesIds?: ReadonlyArray<string>, userId?: string}, skip: number, limit: number): Promise<readonly UserBookEntity[]> {
    const searchFilters: any = {}
    if (filters.librariesIds != null) {
      searchFilters.libraries = { $all: filters.librariesIds }
    }
    if (filters.userId != null) {
      searchFilters.userId = filters.userId
    }
    const dbUserBooks = await this.collection
      .find(searchFilters)
      .skip(skip)
      .limit(limit)
      .toArray()

    return dbUserBooks.map(dbUserBookToEntity).filter(isNotNull)
  }

  async count (filters: {librariesIds?: ReadonlyArray<string>, userId?: string}): Promise<number> {
    const searchFilters: any = {}
    if (filters.librariesIds != null) {
      searchFilters.libraries = { $all: filters.librariesIds }
    }
    if (filters.userId != null) {
      searchFilters.userId = filters.userId
    }
    const total = await this.collection.countDocuments(searchFilters)
    return total
  }

  async deleteAll (libraryId: string, userId: string): Promise<void> {
    /* add session to use in a transaction */
    await this.collection.updateMany({ libraries: libraryId, userId }, { $pull: { libraries: libraryId } })
  }

  async update (id: string, userId: string, data: UpdateUserBook): Promise<UserBookEntity | null> {
    const upd = await this.collection.findOneAndUpdate(
      { _id: id, userId },
      {
        $set: { ...data }
      },
      {
        returnDocument: 'after'
      }
    )
    return dbUserBookToEntity(upd)
  }
}

export default new UserBooksDao()
