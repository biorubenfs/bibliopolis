import { NewBook } from '../books/books.interfaces.js'
import { GoogleBooksVolume } from './google-books/google-books.types.js'
import openLibraryApi from './open-library/open-library.api.js'
import { OpenLibraryBook } from './open-library/open-library.types.js'
import { BooksSource } from './sources.types.js'

export async function buildBookToBibliopolis (source: BooksSource, book: OpenLibraryBook | GoogleBooksVolume): Promise<NewBook> {
  switch (source) {
    case BooksSource.OPEN_LIBRARY: {
      const openLibraryBook = book as OpenLibraryBook
      const workKey = openLibraryBook.works[0].key
      if (workKey == null) {
        throw new Error('say something util')
      }
      const work = await openLibraryApi.fetchWorkById(workKey)
      const authors = await Promise.all(work.authors.map(async author => await openLibraryApi.fetchAuthorById(author.author.key)))

      return {
        title: openLibraryBook.title,
        isbn13: openLibraryBook.isbn_13?.at(0) ?? null,
        isbn10: openLibraryBook.isbn_10?.at(0) ?? null,
        authors: authors.map(author => author.personal_name),
        cover: {
          source: BooksSource.OPEN_LIBRARY,
          value: openLibraryBook.covers?.at(0)?.toString() ?? null
        }
      }
    }
    case BooksSource.GOOGLE_BOOKS: {
      const googleBooksVolumeInfo = book as GoogleBooksVolume
      return {
        title: googleBooksVolumeInfo.volumeInfo.title,
        isbn13: googleBooksVolumeInfo.volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier ?? null,
        isbn10: googleBooksVolumeInfo.volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier ?? null,
        authors: googleBooksVolumeInfo.volumeInfo.authors ?? [],
        cover: {
          source: BooksSource.GOOGLE_BOOKS,
          value: googleBooksVolumeInfo.volumeInfo.imageLinks != null ? googleBooksVolumeInfo.id : null // in google books we store just the id of the volume and then we can fetch the cover url with it
        }
      }
    }
  }
}
