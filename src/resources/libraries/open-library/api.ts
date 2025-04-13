import config from '../../../config.js'
import { Author, OpenLibraryBook } from './types.js'

class OpenLibraryApi {
  private readonly domain: URL

  constructor (domain: URL) {
    this.domain = domain
  }

  async fetchBookByEdition (editionId: string): Promise<OpenLibraryBook> {
    const url = new URL(`/books/${editionId}.json`, this.domain)
    const response = await fetch(url)
    const data: OpenLibraryBook = await response.json()
    return data
  }

  async fetchAuthorById (identifierKey: string): Promise<Author> {
    const url = new URL(`${identifierKey}.json`, this.domain)
    const response = await fetch(url)
    const data: Author = await response.json()
    return data
  }
}

export default new OpenLibraryApi(config.openLibrary.domain)
