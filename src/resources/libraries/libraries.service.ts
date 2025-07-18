import { CollectionResultObject, SingleResultObject } from '../../results.js'
import { runInTransaction } from '../../transaction-helper.js'
import { Page } from '../../types.js'
import userBooksDao from '../user-books/user-books.dao.js'
import { UserBookNotFoundError } from '../user-books/user-books.error.js'
import { Role } from '../users/users.interfaces.js'
import librariesDao from './libraries.dao.js'
import { LibraryEntity } from './libraries.entity.js'
import { BookAlreadyExistingInLibrary, BookNotFoundInLibraryError, LibraryAlreadyExistsError, LibraryNotFoundError, LibraryPermissionsError } from './libraries.error.js'
import { NewLibrary } from './libraries.interfaces.js'
import { ensureBookExistsInBooks } from './open-library/utils.js'

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

  async delete (id: string, userId: string, role: Role): Promise<void> {
    const library = await this.get(id, userId, role)

    await librariesDao.delete(library.entity.id)
    await userBooksDao.deleteAll(id, userId)
  }

  async list (userId: string, role: Role, page: Page, search?: string): Promise<CollectionResultObject<LibraryEntity>> {
    const [libraries, total] = await Promise.all([
      await librariesDao.list(userId, role, page.skip, page.limit, search),
      await librariesDao.count(userId, role, search)
    ])

    const mockPaginationObject = { ...page, total }
    return new CollectionResultObject(libraries, mockPaginationObject)
  }

  async addBook (libraryId: string, isbn13: string, userId: string): Promise<SingleResultObject<LibraryEntity>> {
    const library = await this.get(libraryId, userId, Role.Regular)
    const book = await ensureBookExistsInBooks(isbn13)

    const updatedLibrary = await runInTransaction<LibraryEntity>(async (session) => {
      const userBook = await userBooksDao.upsert(libraryId, userId, book, session)
      if (userBook == null) throw new UserBookNotFoundError('user book not found')

      if (library.entity.books.includes(userBook.id)) {
        // do nothing else
        // return library.entity
        throw new BookAlreadyExistingInLibrary(`book with id ${book.id} already exists in library ${libraryId}`)
      }

      const updated = await librariesDao.addBookIdToLibrary(library.entity.id, userBook.id, session)
      if (updated == null) throw new Error('should not happen')

      return updated
    })

    return new SingleResultObject(updatedLibrary)
  }

  async removeBook (libraryId: string, userBookId: string, userId: string): Promise<SingleResultObject<LibraryEntity>> {
    const library = await this.get(libraryId, userId, Role.Regular)

    if (!library.entity.books.includes(userBookId)) {
      throw new BookNotFoundInLibraryError(`book with id ${userBookId} not found in library ${libraryId}`)
    }

    const updatedLibrary = await runInTransaction(async (session) => {
      const updatedLibrary = await librariesDao.removeBookIdFromLibrary(library.entity.id, userBookId)
      if (updatedLibrary == null) {
        throw new Error('should not happen')
      }

      await userBooksDao.delete(libraryId, userBookId, userId, session)

      return updatedLibrary
    })

    return new SingleResultObject(updatedLibrary)
  }
}

export default new LibrariesService()
