import { BookEntity } from '../../books/books.entity.js'
import { NewBook } from '../../books/books.interfaces.js'
import booksService from '../../books/books.service.js'
import openLibraryApi from './api.js'
import { OpenLibraryBook } from './types.js'

// function notNullish<T> (value: T): value is NonNullable<T> {
//   return value != null // filter null and undefined
// }

async function buildBook (openLibraryBook: OpenLibraryBook): Promise<NewBook> {
  const authorsKeys = openLibraryBook.authors.map(author => author.key)
  const authors = await getAuthorsFromKey(authorsKeys)

  return {
    title: openLibraryBook.title,
    isbn_13: openLibraryBook.isbn_13?.at(0) ?? 'N/A',
    authors,
    cover: openLibraryBook.covers?.at(0) ?? null
  }
}

export async function ensureBookExistsInBooks (isbn: string): Promise<BookEntity> {
  const book = await booksService.fetchByIsbn(isbn)

  if (book != null) return book

  const openLibraryBook = await openLibraryApi.fetchBookByIsbn(isbn)

  const newBook = await buildBook(openLibraryBook)

  const createdBook = await booksService.create(newBook)

  return createdBook.entity
}

export async function getAuthorsFromKey (authorsKeys: readonly string[]): Promise<string[]> {
  const authors = await Promise.all(
    authorsKeys.map(async authorKey => await openLibraryApi.fetchAuthorById(authorKey))
  )
  return authors.map(author => author.personal_name)
}
