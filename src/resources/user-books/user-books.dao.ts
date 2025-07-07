import { ulid } from 'ulid'
import Dao from '../../dao.js'
import { isNotNull } from '../../utils.js'
import { DBUserBook } from './user-books.interfaces.js'
import { UserBookEntity } from './user-books.entity.js'
import { ClientSession } from 'mongodb'

function dbUserBookToEntity (dbUserBook: DBUserBook | null): UserBookEntity | null {
  return dbUserBook == null ? null : new UserBookEntity(dbUserBook)
}

class UserBooksDao extends Dao<DBUserBook> {
  constructor () {
    super('user_books')
  }

  async upsert (libraryId: string, userId: string, book: { id: string, title: string, authors: readonly string[], cover: number | null }): Promise<void> {
    await this.collection.updateOne(
      { userId, bookId: book.id },
      {
        $setOnInsert: {
          _id: ulid(),
          bookTitle: book.title,
          bookAuthors: book.authors,
          bookCover: book.cover,
          rating: null,
          notes: null
        },
        $push: { libraries: libraryId } // or $addToSet if we want to avoid duplicates, although we control this situation on libraries service)
      },
      { upsert: true } // options
    )
  }

  async delete (libraryId: string, bookId: string, userId: string, session: ClientSession): Promise<void> {
    await this.collection.updateOne({ libraries: libraryId, bookId, userId }, { $pull: { libraries: libraryId } }, { session })
  }

  async list (libraryId: string, userId: string, skip: number, limit: number): Promise<readonly UserBookEntity[]> {
    const dbUserBooks = await this.collection.find({ libraries: libraryId, userId })
      .skip(skip)
      .limit(limit)
      .toArray()

    return dbUserBooks.map(dbUserBookToEntity).filter(isNotNull)
  }

  async count (libraryId: string, userId: string): Promise<number> {
    const total = await this.collection.countDocuments({ libraries: libraryId, userId })
    return total
  }

  async deleteAll (libraryId: string, userId: string): Promise<void> {
    /* add session to use in a transaction */
    await this.collection.updateMany({ libraries: libraryId, userId }, { $pull: { libraries: libraryId } })
  }
}

export default new UserBooksDao()
