import { CollectionResultObject, SingleResultObject } from '../../results.js'
import { Page } from '../../types.js'
import booksService from '../books/books.service.js'
import librariesBooksDao from '../libraries-books/libraries-books.dao.js'
import { Role } from '../users/users.interfaces.js'
import librariesDao from './libraries.dao.js'
import { LibraryEntity } from './libraries.entity.js'
import { BookNotFoundInLibraryError, LibraryAlreadyExistsError, LibraryNotFoundError, LibraryPermissionsError } from './libraries.error.js'
import { NewLibrary } from './libraries.interfaces.js'

class LibrariesService {
  async create (body: NewLibrary, userId: string): Promise<SingleResultObject<LibraryEntity>> {
    const existingLibraries = await librariesDao.findByUserAndName(body.name, userId)
    if (existingLibraries != null) {
      throw new LibraryAlreadyExistsError(`user has already a library with name ${body.name}`)
    }
    const newLibrary = await librariesDao.create(body, userId)
    return new SingleResultObject(newLibrary)
  }

  async get (id: string, userId: string, role: Role): Promise<SingleResultObject<LibraryEntity>> {
    const library = await librariesDao.findById(id)

    if (library == null) {
      throw new LibraryNotFoundError('library not found')
    }

    if (role !== Role.Admin && library.userId !== userId) {
      throw new LibraryPermissionsError('library not found')
    }

    return new SingleResultObject(library)
  }

  async list (userId: string, role: Role, page: Page): Promise<CollectionResultObject<LibraryEntity>> {
    const [libraries, total] = await Promise.all([
      await librariesDao.list(userId, role, page.skip, page.limit),
      await librariesDao.count(userId, role)
    ])

    const mockPaginationObject = { page, total }
    return new CollectionResultObject(libraries, mockPaginationObject)
  }

  async addBook (libraryId: string, bookId: string, userId: string): Promise<SingleResultObject<LibraryEntity>> {
    const library = await this.get(libraryId, userId, Role.Regular)
    const book = await booksService.getById(bookId)

    const updatedLibrary = await librariesDao.addBookIdToLibrary(library.entity.id, bookId)

    if (updatedLibrary == null) {
      throw new Error('should not happen')
    }

    await librariesBooksDao.create({ libraryId, userId, bookId: book.entity.id, bookTitle: book.entity.title, bookAuthors: book.entity.authors })

    return new SingleResultObject(updatedLibrary)
  }

  async removeBook (libraryId: string, bookId: string, userId: string): Promise<SingleResultObject<LibraryEntity>> {
    const library = await this.get(libraryId, userId, Role.Regular)

    if (!library.entity.books.includes(bookId)) {
      throw new BookNotFoundInLibraryError(`book with id ${bookId} not found in library ${libraryId}`)
    }

    const updatedLibrary = await librariesDao.removeBookIdFromLibrary(library.entity.id, bookId)
    if (updatedLibrary == null) {
      throw new Error('should not happen')
    }

    await librariesBooksDao.delete(libraryId, bookId, userId)

    return new SingleResultObject(updatedLibrary)
  }
}

export default new LibrariesService()
