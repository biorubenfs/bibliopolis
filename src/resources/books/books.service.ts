import { CollectionResultObject, SingleResultObject } from '../../results.js'
import { Page } from '../../types.js'
import { NewBook } from '../books/books.interfaces.js'
import booksDao from './books.dao.js'
import { BookEntity } from './books.entity.js'
import { BookAlreadyExistsError, BookNotFoundError } from './books.error.js'

class BooksService {
  async create (body: NewBook): Promise<SingleResultObject<BookEntity>> {
    const existingBook = await booksDao.findByIsbn(body.isbn_13)
    if (existingBook != null) {
      throw new BookAlreadyExistsError(`there is already a book with isbn ${body.isbn_13}`)
    }
    const newBook = await booksDao.create(body)
    return new SingleResultObject(newBook)
  }

  async getById (id: string): Promise<SingleResultObject<BookEntity>> {
    const book = await booksDao.findById(id)
    if (book == null) {
      throw new BookNotFoundError(`book with id ${id} not found`)
    }

    return new SingleResultObject(book)
  }

  async getByIsbn (isbn: string): Promise<SingleResultObject<BookEntity>> {
    const book = await booksDao.findByIsbn(isbn)
    if (book == null) {
      throw new BookNotFoundError(`book with isbn ${isbn} not found`)
    }

    return new SingleResultObject(book)
  }

  async list (page: Page): Promise<CollectionResultObject<BookEntity>> {
    const [books, total] = await Promise.all([
      await booksDao.list(page.skip, page.limit),
      await booksDao.count()
    ])

    return new CollectionResultObject(books, { page, total })
  }
}

export default new BooksService()
