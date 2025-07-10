import { CollectionResultObject, SingleResultObject } from '../../results.js'
import { Page } from '../../types.js'
import librariesDao from '../libraries/libraries.dao.js'
import { LibraryPermissionsError } from '../libraries/libraries.error.js'

import userBooksDao from './user-books.dao.js'
import { UserBookEntity } from './user-books.entity.js'
import { UserBookNotFoundError } from './user-books.error.js'
import { UpdateUserBook } from './user-books.interfaces.js'

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

  async update (id: string, userId: string, data: UpdateUserBook): Promise<SingleResultObject<UserBookEntity>> {
    const updUserBookEntity = await userBooksDao.update(id, userId, data)
    if (updUserBookEntity == null) {
      throw new UserBookNotFoundError('user book not found')
    }
    return new SingleResultObject(updUserBookEntity)
  }
}

export default new UserBooksService()
