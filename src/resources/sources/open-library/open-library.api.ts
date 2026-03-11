import config from '../../../config.js'
import { BooksApiError } from '../../../error/errors.js'
import logger from '../../../logger.js'
import { BookNotFoundError } from '../../books/books.error.js'
import { OpenLibraryAuthor, OpenLibraryBook, OpenLibraryWork } from './open-library.types.js'

class OpenLibraryApi {
  private readonly domain: URL

  constructor (domain: URL) {
    this.domain = domain
  }

  async fetchBookByIsbn (isbn: string): Promise<OpenLibraryBook | null> {
    try {
      const url = new URL(`/isbn/${isbn}.json`, this.domain)
      const response = await fetch(url)

      if (!response.ok) {
        throw new BooksApiError(`Failed to fetch book by ISBN: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      logger.error('Error fetching book from Open Library API', { error, isbn })
      return null
    }
  }

  async fetchWorkById (workKey: string): Promise<OpenLibraryWork | null> {
    try {
      const url = new URL(`${workKey}.json`, this.domain)
      const response = await fetch(url)

      if (response.status === 404) {
        throw new BookNotFoundError('work not found in open library')
      }

      return await response.json()
    } catch (error) {
      logger.error('Error fetching work from Open Library API', { error, workKey })
      return null
    }
  }

  async fetchAuthorById (identifierKey: string): Promise<string | null> {
    try {
      const url = new URL(`${identifierKey}.json`, this.domain)
      const response = await fetch(url)

      if (!response.ok) {
        throw new BooksApiError(`Failed to fetch author: ${response.statusText}`)
      }

      const authorData: OpenLibraryAuthor = await response.json()
      return authorData.personal_name ?? authorData.name
    } catch (error) {
      logger.error('Error fetching author from Open Library API', { error, identifierKey })
      return null
    }
  }
}

export default new OpenLibraryApi(config.openLibrary.domain)
