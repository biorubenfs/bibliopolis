import { CollectionResultObject } from '../../results.js'
import { Page } from '../../types.js'
import librariesDao from '../libraries/libraries.dao.js'
import { LibraryPermissionsError } from '../libraries/libraries.error.js'

import librariesBooksDao from './libraries-books.dao.js'
import { LibraryBookEntity } from './libraries-books.entity.js'

class LibrariesBooksService {
  async list (libraryId: string, userId: string, page: Page): Promise<CollectionResultObject<LibraryBookEntity>> {
    const library = await librariesDao.findById(libraryId)
    if (library == null || library.userId !== userId) {
      throw new LibraryPermissionsError('user is not owner of the library')
    }

    const [librariesBooks, total] = await Promise.all([
      await librariesBooksDao.list(libraryId, userId, page.skip, page.limit),
      await librariesBooksDao.count(libraryId, userId)
    ])

    const mockPaginationObject = { page, total }
    return new CollectionResultObject(librariesBooks, mockPaginationObject)
  }
}

export default new LibrariesBooksService()
