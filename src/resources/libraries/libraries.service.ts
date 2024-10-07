import { CollectionResultObject, SingleResultObject } from '../../results.js'
import { Role } from '../users/users.interfaces.js'
import librariesDao from './libraries.dao.js'
import { LibraryNotFound, LibraryPermissionsError } from './libraries.error.js'
import { NewLibrary } from './libraries.interfaces.js'

class LibrariesService {
  async create (body: NewLibrary, userId: string): Promise<SingleResultObject> {
    const newLibrary = await librariesDao.create(body, userId)
    return new SingleResultObject(newLibrary)
  }

  async get (id: string, userId: string, role: Role): Promise<SingleResultObject> {
    const library = await librariesDao.findById(id)

    if (library == null) {
      throw new LibraryNotFound('library not found')
    }

    if (role !== Role.Admin && library.userId !== userId) {
      throw new LibraryPermissionsError('library not found')
    }

    return new SingleResultObject(library)
  }

  async list (userId: string, role: Role): Promise<CollectionResultObject> {
    const libraries = await librariesDao.list(userId, role)

    const mockPaginationObject = { page: { skip: 0, limit: 0 }, total: 0 }
    return new CollectionResultObject(libraries, mockPaginationObject)
  }
}

export default new LibrariesService()
