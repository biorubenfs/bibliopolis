import { CollectionResultObject, SingleResultObject } from '../../results.js'
import { Page } from '../../types.js'
import { ISBNUtils } from '../../utils/isbn.utils.js'
import { NewBook } from '../books/books.interfaces.js'
import booksDao from './books.dao.js'
import { BookEntity } from './books.entity.js'
import { BookAlreadyExistsError, BookNotFoundError } from './books.error.js'

class BooksService {
  async create (body: NewBook): Promise<SingleResultObject<BookEntity>> {
    const { isbn_10, isbn_13 } = ISBNUtils.calculateIsbns(body.isbn_10, body.isbn_13)

    const existingBook = await booksDao.findByIsbn(isbn_13)
    if (existingBook != null) {
      throw new BookAlreadyExistsError(`there is already a book with isbn ${isbn_13}`)
    }

    const bookData = {
      title: body.title,
      authors: body.authors,
      isbn_13,
      isbn_10,
      cover: body.cover ?? null
    }

    const newBook = await booksDao.create(bookData)
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

  async fetchByIsbn (isbn: string): Promise<BookEntity | null> {
    const book = await booksDao.findByIsbn(isbn)

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
