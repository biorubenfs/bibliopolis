import { BookEntity } from '../../books/books.entity.js'
import booksService from '../../books/books.service.js'
import { NewBook } from '../../books/books.interfaces.js'
import { BookNotFoundError } from '../../books/books.error.js'

// function notNullish<T> (value: T): value is NonNullable<T> {
//   return value != null // filter null and undefined
// }

export async function ensureBookExistsInBooks (book: NewBook): Promise<BookEntity> {
  if (book.isbn13 == null && book.isbn10 == null) {
    throw new BookNotFoundError('isbn13 or isbn10 must be provided')
  }
  const isbn = book.isbn13 ?? book.isbn10 as string
  const existingBook = await booksService.fetchByIsbn(isbn)

  if (existingBook != null) return existingBook

  const createdBook = await booksService.create(book)

  return createdBook.entity
}
