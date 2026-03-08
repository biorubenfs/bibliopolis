import { BookEntity } from '../../books/books.entity.js'
import booksService from '../../books/books.service.js'
import { buildBookToBibliopolis } from '../sources.utils.js'
import openLibraryApi from './open-library.api.js'
import { getBookFromSources } from '../../../utils.js'

// function notNullish<T> (value: T): value is NonNullable<T> {
//   return value != null // filter null and undefined
// }

export async function ensureBookExistsInBooks (isbn: string): Promise<BookEntity> {
  const book = await booksService.fetchByIsbn(isbn)

  if (book != null) return book

  const { source, fetchedBook, cover: coverFromOtherSource } = await getBookFromSources(isbn)

  const newBook = await buildBookToBibliopolis(source, fetchedBook, coverFromOtherSource)

  const createdBook = await booksService.create(newBook)

  return createdBook.entity
}

export async function getAuthorsFromKey (
  authorsKeys: readonly string[]
): Promise<string[]> {
  const authors = await Promise.all(
    authorsKeys.map(
      async (authorKey) => await openLibraryApi.fetchAuthorById(authorKey)
    )
  )
  return authors.map((author) => author.personal_name)
}
