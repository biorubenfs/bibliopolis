import { CollectionResultObject } from '../../results.js'
import librariesDao from '../libraries/libraries.dao.js'
import { LibraryPermissionsError } from '../libraries/libraries.error.js'

import librariesBooksDao from './libraries-books.dao.js'
import { LibraryBookEntity } from './libraries-books.entity.js'

class LibrariesBooksService {
  async list (libraryId: string, userId: string): Promise<CollectionResultObject<LibraryBookEntity>> {
    const library = await librariesDao.findById(libraryId)
    if (library == null || library.userId !== userId) {
      throw new LibraryPermissionsError('user is not owner of the library')
    }

    const librariesBooks = await librariesBooksDao.list(libraryId, userId)

    const mockPaginationObject = { page: { skip: 0, limit: 0 }, total: 0 }
    return new CollectionResultObject(librariesBooks, mockPaginationObject)
  }
}

export default new LibrariesBooksService()
