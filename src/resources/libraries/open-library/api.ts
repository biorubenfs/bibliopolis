import config from '../../../config'
import { Author, Edition } from './types'

class OpenLibraryApi {
  private readonly domain: URL

  constructor (domain: URL) {
    this.domain = domain
  }

  async fetchBookByEdition (editionId: string): Promise<Edition> {
    const url = new URL(`/books/${editionId}.json`, this.domain)
    const response = await fetch(url)
    const data: Edition = await response.json()
    return data
  }

  async fetchAuthorById (identifierKey: string): Promise<Author> {
    const url = new URL(identifierKey, this.domain)
    const response = await fetch(url)
    const data: Author = await response.json()
    return data
  }
}

export default new OpenLibraryApi(config.openLibrary.domain)
