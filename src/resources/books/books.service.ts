import { CollectionResultObject, SingleResultObject } from '../../results.js'
import { Page } from '../../types.js'
import { NewBook } from '../books/books.interfaces.js'
import booksDao from './books.dao.js'
import { BookEntity } from './books.entity.js'
import { BookAlreadyExistsError, BookNotFoundError } from './books.error.js'

class BooksService {
  async create (body: NewBook): Promise<SingleResultObject<BookEntity>> {
    if (body.isbn_13 == null && body.isbn_10 == null) {
      throw new Error('at least one between isbn_13 and isbn_10 must be provided')
    }

    if (body.isbn_13 != null) {
      const existingBookByIsbn13 = await booksDao.findByIsbn13(body.isbn_13)
      if (existingBookByIsbn13 != null) {
        throw new BookAlreadyExistsError(`there is already a book with isbn ${body.isbn_13}`)
      }
    }

    if (body.isbn_10 != null) {
      const existingBookByIsbn10 = await booksDao.findByIsbn10(body.isbn_10)
      if (existingBookByIsbn10 != null) {
        throw new BookAlreadyExistsError(`there is already a book with isbn ${body.isbn_10}`)
      }
    }

    const newBook = await booksDao.create(body)
    return new SingleResultObject(newBook)
  }

  async fetchById (id: string): Promise<BookEntity | null> {
    return await booksDao.findById(id)
  }

  async getById (id: string): Promise<SingleResultObject<BookEntity>> {
    const book = await booksDao.findById(id)
    if (book == null) {
      throw new BookNotFoundError(`book with id ${id} not found`)
    }

    return new SingleResultObject(book)
  }

  async fetchByIsbn13 (isbn: string): Promise<BookEntity | null> {
    const book = await booksDao.findByIsbn13(isbn)

    return book
  }

  async fetchByIsbn10 (isbn: string): Promise<BookEntity | null> {
    const book = await booksDao.findByIsbn10(isbn)

    return book
  }

  async list (page: Page): Promise<CollectionResultObject<BookEntity>> {
    const [books, total] = await Promise.all([
      await booksDao.list(page.skip, page.limit),
      await booksDao.count()
    ])

    return new CollectionResultObject(books, { ...page, total })
  }
}

export default new BooksService()
