import { CollectionResultObject, SingleResultObject } from '../../results.js'
import { Page } from '../../types.js'
import { LibraryPermissionsError } from '../libraries/libraries.error.js'
import librariesService from '../libraries/libraries.service.js'
import { Role } from '../users/users.interfaces.js'

import userBooksDao from './user-books.dao.js'
import { UserBookEntity } from './user-books.entity.js'
import { UserBookPermissionsError, UserBookNotFoundError } from './user-books.error.js'
import { UpdateUserBook } from './user-books.interfaces.js'

class UserBooksService {
  async list (page: Page, userId: string, role: Role, filter: { userId?: string, librariesIds?: readonly string[] }): Promise<CollectionResultObject<UserBookEntity>> {
    if (filter.userId !== userId && role !== Role.Admin) {
      throw new UserBookPermissionsError('user can only list this own books')
    }

    if (role !== Role.Admin) {
      const libraries = await librariesService.list(userId, role, page)
      const userLibIds = libraries.entities.map(lib => lib.id)
      if (filter.librariesIds != null) {
        const hasInvalidLibId = filter.librariesIds.some(libId => !userLibIds.includes(libId))
        if (hasInvalidLibId) {
          throw new LibraryPermissionsError('user can only list books from own libraries')
        }
      } else {
        filter.librariesIds = userLibIds
      }
    }

    const [userBooks, total] = await Promise.all([
      await userBooksDao.list(filter, page.skip, page.limit),
      await userBooksDao.count(filter)
    ])

    const mockPaginationObject = { ...page, total }
    return new CollectionResultObject(userBooks, mockPaginationObject)
  }

  async get (id: string, userId: string): Promise<SingleResultObject<UserBookEntity>> {
    const userBook = await userBooksDao.findById(id)

    if (userBook == null || userBook.userId !== userId) {
      throw new UserBookNotFoundError('user book not found')
    }

    return new SingleResultObject(userBook)
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
