import { CollectionResultObject, SingleResultObject } from '../../results.js'
import { Role } from '../users/users.interfaces.js'
import librariesDao from './libraries.dao.js'
import { LibraryEntity } from './libraries.entity.js'
import { LibraryNotFound, LibraryPermissionsError } from './libraries.error.js'
import { NewLibrary } from './libraries.interfaces.js'

class LibrariesService {
  async create (body: NewLibrary, userId: string): Promise<SingleResultObject<LibraryEntity>> {
    const newLibrary = await librariesDao.create(body, userId)
    return new SingleResultObject(newLibrary)
  }

  async get (id: string, userId: string, role: Role): Promise<SingleResultObject<LibraryEntity>> {
    const library = await librariesDao.findById(id)

    if (library == null) {
      throw new LibraryNotFound('library not found')
    }

    if (role !== Role.Admin && library.userId !== userId) {
      throw new LibraryPermissionsError('library not found')
    }

    return new SingleResultObject(library)
  }

  async list (userId: string, role: Role): Promise<CollectionResultObject<LibraryEntity>> {
    const libraries = await librariesDao.list(userId, role)

    const mockPaginationObject = { page: { skip: 0, limit: 0 }, total: 0 }
    return new CollectionResultObject(libraries, mockPaginationObject)
  }

  async addBookToLibrary (libraryId: string, bookId: string): Promise<LibraryEntity> {
    const library = await librariesDao.addBookIdToLibrary(libraryId, bookId)
    if (library == null) throw new Error()
    return library
  }

  async removeBookFromLibrary (libraryId: string, bookId: string): Promise<LibraryEntity> {
    const library = await librariesDao.removeBookIdFromLibrary(libraryId, bookId)
    if (library == null) throw new Error()
    return library
  }
}

export default new LibrariesService()
