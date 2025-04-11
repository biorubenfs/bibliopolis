import { ulid } from 'ulid'
import Dao from '../../dao.js'
import { isNotNull } from '../../utils.js'
import { DBUserBook, NewUserBook } from './user-books.interfaces.js'
import { UserBookEntity } from './user-books.entity.js'

function dbUserBookToEntity (dbUserBook: DBUserBook | null): UserBookEntity | null {
  return dbUserBook == null ? null : new UserBookEntity(dbUserBook)
}

class UserBooksDao extends Dao<DBUserBook> {
  constructor () {
    super('user_books')
  }

  async create (newUserBook: NewUserBook): Promise<void> {
    const now = new Date()
    const dbUserBook: DBUserBook = {
      ...newUserBook,
      _id: ulid(),
      createdAt: now,
      updatedAt: now
    }

    await this.collection.insertOne(dbUserBook)
  }

  async delete (libraryId: string, bookId: string, userId: string): Promise<void> {
    await this.collection.deleteOne({ libraryId, bookId, userId })
  }

  async list (libraryId: string, userId: string, skip: number, limit: number): Promise<readonly UserBookEntity[]> {
    const dbUserBooks = await this.collection.find({ libraryId, userId })
      .skip(skip)
      .limit(limit)
      .toArray()

    return dbUserBooks.map(dbUserBookToEntity).filter(isNotNull)
  }

  async count (libraryId: string, userId: string): Promise<number> {
    const total = await this.collection.countDocuments({ libraryId, userId })
    return total
  }
}

export default new UserBooksDao()
