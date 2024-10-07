import { ulid } from 'ulid'
import Dao from '../../dao.js'
import { DBBook, NewBook } from './books.interfaces.js'
import { BookEntity } from './books.entity.js'
import { BookAlreadyExists } from './books.error.js'

function dbBookToEntity (dbBook: DBBook | null): BookEntity | null {
  return dbBook == null ? null : new BookEntity(dbBook)
}

function isNotNull<T> (value: T | null): value is T {
  return value !== null
}

class BooksDao extends Dao<DBBook> {
  constructor () {
    super('books')
  }

  async init (): Promise<void> { }

  async create (newBook: NewBook): Promise<BookEntity> {
    const current = await this.collection.findOne({ isbn_13: newBook.isbn_13 })
    if (current != null) {
      throw new BookAlreadyExists(`book with this isbn ${newBook.isbn_13} already exists`)
    }
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

  async list (): Promise<readonly BookEntity[]> {
    const dbBooks = await this.collection.find().toArray()

    return dbBooks.map(dbBookToEntity).filter(isNotNull)
  }
}

export default new BooksDao()
