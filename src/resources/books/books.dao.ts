import { ulid } from 'ulid'
import Dao from '../../dao.js'
import { DBBook, NewBook } from './books.interfaces.js'
import { BookEntity } from './books.entity.js'
import { isNotNull } from '../../utils.js'

function dbBookToEntity (dbBook: DBBook | null): BookEntity | null {
  return dbBook == null ? null : new BookEntity(dbBook)
}

class BooksDao extends Dao<DBBook> {
  constructor () {
    super('books')
  }

  async init (): Promise<void> { }

  async create (newBook: NewBook): Promise<BookEntity> {
    const now = new Date()
    const dbBook: DBBook = {
      ...newBook,
      _id: ulid(),
      createdAt: now,
      updatedAt: now
    }
    await this.collection.insertOne(dbBook)

    return new BookEntity(dbBook)
  }

  async findById (id: string): Promise<BookEntity | null> {
    const dbBook = await this.collection.findOne({ _id: id })

    return dbBookToEntity(dbBook)
  }

  async findByIsbn (isbn: string): Promise<BookEntity | null> {
    const dbBook = await this.collection.findOne({ isbn_13: isbn })

    return dbBookToEntity(dbBook)
  }

  async list (skip: number, limit: number): Promise<readonly BookEntity[]> {
    const dbBooks = await this.collection.find().sort({ createdAt: -1 }).skip(skip).limit(limit).toArray()

    return dbBooks.map(dbBookToEntity).filter(isNotNull)
  }

  async count (): Promise<number> {
    const total = await this.collection.countDocuments()
    return total
  }
}

export default new BooksDao()
