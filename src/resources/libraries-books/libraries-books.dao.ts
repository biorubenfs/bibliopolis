import { ulid } from 'ulid'
import Dao from '../../dao.js'
import { isNotNull } from '../../utils.js'
import { DBLibraryBook, NewLibraryBook } from './libraries-books.interfaces.js'
import { LibraryBookEntity } from './libraries-books.entity.js'

function dbLibraryBookToEntity (dbLibraryBook: DBLibraryBook | null): LibraryBookEntity | null {
  return dbLibraryBook == null ? null : new LibraryBookEntity(dbLibraryBook)
}

class LibrariesBooksDao extends Dao<DBLibraryBook> {
  constructor () {
    super('libraries_books')
  }

  async create (newLibraryBook: NewLibraryBook): Promise<void> {
    const now = new Date()
    const dbLibraryBook: DBLibraryBook = {
      ...newLibraryBook,
      _id: ulid(),
      createdAt: now,
      updatedAt: now
    }

    await this.collection.insertOne(dbLibraryBook)
  }

  async delete (libraryId: string, bookId: string, userId: string): Promise<void> {
    await this.collection.deleteOne({ libraryId, bookId, userId })
  }

  async list (libraryId: string, userId: string, skip: number, limit: number): Promise<readonly LibraryBookEntity[]> {
    const dbLibrariesBooks = await this.collection.find({ libraryId, userId })
      .skip(skip)
      .limit(limit)
      .toArray()

    return dbLibrariesBooks.map(dbLibraryBookToEntity).filter(isNotNull)
  }

  async count (libraryId: string, userId: string): Promise<number> {
    const total = await this.collection.countDocuments({ libraryId, userId })
    return total
  }
}

export default new LibrariesBooksDao()
