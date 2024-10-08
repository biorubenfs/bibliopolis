import { CollectionResultObject, SingleResultObject } from '../../results.js'
import { NewBook } from '../books/books.interfaces.js'
import booksDao from './books.dao.js'
import { BookEntity } from './books.entity.js'
import { BookNotFound } from './books.error.js'

class BooksService {
  async create (body: NewBook): Promise<SingleResultObject<BookEntity>> {
    const newBook = await booksDao.create(body)
    return new SingleResultObject(newBook)
  }

  async getById (id: string): Promise<SingleResultObject<BookEntity>> {
    const book = await booksDao.findById(id)
    if (book == null) {
      throw new BookNotFound(`book with id ${id} not found`)
    }

    return new SingleResultObject(book)
  }

  async getByIsbn (isbn: string): Promise<SingleResultObject<BookEntity>> {
    const book = await booksDao.findByIsbn(isbn)
    if (book == null) {
      throw new BookNotFound(`book with isbn ${isbn} not found`)
    }

    return new SingleResultObject(book)
  }

  async list(skip: number, limit: number): Promise<CollectionResultObject<BookEntity>> {
    console.log({skip, limit})
    const books = await booksDao.list(skip, limit)
    const total = await booksDao.count()

    const mockPaginationObject = { page: { limit: limit, skip: skip }, total: total }

    return new CollectionResultObject(books, mockPaginationObject)
  }
}

export default new BooksService()
