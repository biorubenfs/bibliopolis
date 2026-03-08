import config from '../../../config.js'
import { BooksApiError } from '../../../error/errors.js'
import { BookNotFoundError } from '../../books/books.error.js'
import { GoogleBooksVolume } from './google-books.types.js'

class GoogleBooksApi {
  private readonly domain: URL
  private readonly apiKey: string

  constructor (domain: URL, apiKey: string) {
    this.domain = domain
    this.apiKey = apiKey
  }

  async fetchBookByIsbn (isbn: string): Promise<GoogleBooksVolume> {
    const url = new URL('/books/v1/volumes', this.domain)
    url.searchParams.set('q', `isbn:${isbn}`)
    url.searchParams.set('key', this.apiKey)

    const response = await fetch(url)

    if (!response.ok) {
      throw new BooksApiError(`Failed to fetch book by ISBN: ${response.statusText}`)
    }

    const responseData = await response.json()

    if (responseData.items == null || responseData.items.length === 0) {
      throw new BookNotFoundError('not found in google books')
    }

    return responseData.items?.at(0) ?? null
  }
}

export default new GoogleBooksApi(config.googleBooks.domain, config.googleBooks.apiKey)
