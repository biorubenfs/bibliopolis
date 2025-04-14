import { CollectionResultObject } from '../../results.js'
import { Page } from '../../types.js'
import librariesDao from '../libraries/libraries.dao.js'
import { LibraryPermissionsError } from '../libraries/libraries.error.js'

import userBooksDao from './user-books.dao.js'
import { UserBookEntity } from './user-books.entity.js'

class UserBooksService {
  async list (libraryId: string, userId: string, page: Page): Promise<CollectionResultObject<UserBookEntity>> {
    const library = await librariesDao.findById(libraryId)
    if (library == null || library.userId !== userId) {
      throw new LibraryPermissionsError('user is not owner of the library')
    }

    const [userBooks, total] = await Promise.all([
      await userBooksDao.list(libraryId, userId, page.skip, page.limit),
      await userBooksDao.count(libraryId, userId)
    ])

    const mockPaginationObject = { ...page, total }
    return new CollectionResultObject(userBooks, mockPaginationObject)
  }
}

export default new UserBooksService()
