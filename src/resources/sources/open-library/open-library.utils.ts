import { BookEntity } from '../../books/books.entity.js'
import booksService from '../../books/books.service.js'
import googleBooksApi from '../google-books/google-books.api.js'
import { GoogleBooksVolume } from '../google-books/google-books.types.js'
import { BooksSource } from '../sources.types.js'
import { buildBookToBibliopolis } from '../sources.utils.js'
import openLibraryApi from './open-library.api.js'
import { OpenLibraryBook } from './open-library.types.js'

// function notNullish<T> (value: T): value is NonNullable<T> {
//   return value != null // filter null and undefined
// }

export async function ensureBookExistsInBooks (isbn: string): Promise<BookEntity> {
  const book = await booksService.fetchByIsbn(isbn)

  if (book != null) return book

  const apiSources = [
    {
      name: BooksSource.GOOGLE_BOOKS,
      fetch: googleBooksApi.fetchBookByIsbn.bind(googleBooksApi)
    },
    {
      name: BooksSource.OPEN_LIBRARY,
      fetch: openLibraryApi.fetchBookByIsbn
    }
    // Add more sources here in order of priority
  ]

  let source: BooksSource | null = null
  let fetchedBook: OpenLibraryBook | GoogleBooksVolume | null = null

  // Try each source in priority order until we find a result
  for (const apiSource of apiSources) {
    try {
      const result = await apiSource.fetch(isbn)
      if (result != null) {
        source = apiSource.name
        fetchedBook = result
        break // Stop searching once we find a result
      }
    } catch (error) {
      console.log(`error fetching book from ${apiSource.name}`, error)
      // Continue to next source
    }
  }

  if (source == null || fetchedBook == null) {
    throw new Error('Book not found in any source')
  }

  const newBook = await buildBookToBibliopolis(source, fetchedBook)

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
