import config from '../../../config.js'
import { BooksApiError } from '../../../error/errors.js'
import logger from '../../../logger.js'
import { GoogleBooksVolume } from './google-books.types.js'

class GoogleBooksApi {
  private readonly domain: URL
  private readonly apiKey: string

  constructor (domain: URL, apiKey: string) {
    this.domain = domain
    this.apiKey = apiKey
  }

  async fetchBookByIsbn (isbn: string): Promise<GoogleBooksVolume | null> {
    try {
      const url = new URL('/books/v1/volumes', this.domain)
      url.searchParams.set('q', `isbn:${isbn}`)
      url.searchParams.set('key', this.apiKey)

      const response = await fetch(url)

      if (response.status === 404) {
        logger.warn(`Book not found in Google Books API: ${isbn}`)
        return null
      }

      if (!response.ok) {
        throw new BooksApiError(`Failed to fetch book by ISBN: ${response.statusText}`)
      }

      const responseData = await response.json()

      if (responseData.items == null || responseData.items.length === 0) {
        logger.warn(`Book not found in Google Books API: ${isbn}`)
        return null
      }

      return responseData.items.at(0) ?? null
    } catch (error) {
      logger.error(`Error fetching book from Google Books API: ${isbn}`, { error })
      return null
    }
  }
}

export default new GoogleBooksApi(config.googleBooks.domain, config.googleBooks.apiKey)
