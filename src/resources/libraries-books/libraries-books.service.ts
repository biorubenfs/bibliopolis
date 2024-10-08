import { CollectionResultObject } from '../../results.js'
import librariesBooksDao from './libraries-books.dao.js'

class LibrariesBooksService {
  async list (libraryId: string): Promise<CollectionResultObject> {
    const librariesBooks = await librariesBooksDao.list(libraryId)

    const mockPaginationObject = { page: { skip: 0, limit: 0 }, total: 0 }
    return new CollectionResultObject(librariesBooks, mockPaginationObject)
  }
}

export default new LibrariesBooksService()
