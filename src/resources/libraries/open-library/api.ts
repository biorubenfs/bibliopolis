import config from '../../../config.js'
import { BookNotFoundError } from '../../books/books.error.js'
import { OpenLibraryAuthor, OpenLibraryBook, OpenLibraryWork } from './types.js'

class OpenLibraryApi {
  private readonly domain: URL

  constructor (domain: URL) {
    this.domain = domain
  }

  async fetchBookByIsbn (isbn: string): Promise<OpenLibraryBook> {
    const url = new URL(`/isbn/${isbn}.json`, this.domain)
    console.log(url.href)
    const response = await fetch(url)

    if (response.status === 404) {
      throw new BookNotFoundError('not found in open library')
    }

    return await response.json()
  }

  async fetchWorkById (workKey: string): Promise<OpenLibraryWork> {
    const url = new URL(`${workKey}.json`, this.domain)
    console.log(url.href)
    const response = await fetch(url)

    if (response.status === 404) {
      throw new BookNotFoundError('work not found in open library')
    }

    return await response.json()
  }

  async fetchAuthorById (identifierKey: string): Promise<OpenLibraryAuthor> {
    const url = new URL(`${identifierKey}.json`, this.domain)
    console.log(url.href)
    const response = await fetch(url)
    return await response.json()
  }
}

export default new OpenLibraryApi(config.openLibrary.domain)
