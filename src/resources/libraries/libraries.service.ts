import { CollectionResultObject, SingleResultObject } from '../../results.js'
import { runInTransaction } from '../../transaction-helper.js'
import { Page } from '../../types.js'
import { BookNotFoundError } from '../books/books.error.js'
import { NewBook } from '../books/books.interfaces.js'
import booksService from '../books/books.service.js'
import userBooksDao from '../user-books/user-books.dao.js'
import { UserBookNotFoundError } from '../user-books/user-books.error.js'
import { Role } from '../users/users.interfaces.js'
import librariesDao from './libraries.dao.js'
import { LibraryEntity } from './libraries.entity.js'
import { BookAlreadyExistingInLibrary, BookNotFoundInLibraryError, LibraryNameConflictError, LibraryNotFoundError, LibraryPermissionsError } from './libraries.error.js'
import { NewLibrary } from './libraries.interfaces.js'
import logger from '../../logger.js'
import { getBookFromSourcesApis } from '../../utils.js'
import { parseIsbnColumn } from '../../utils/csv-parser.utils.js'
import { ISBNUtils } from '../../utils/isbn.utils.js'

class LibrariesService {
  private async checkLibraryNameAvailable (libraryName: string, userId: string, excludeLibraryId?: string): Promise<void> {
    const existingLibraries = await librariesDao.collection.find({ userId }).toArray()
    const comparableName = libraryName.trim().toLowerCase()
    if (existingLibraries.some(lib => lib.name.trim().toLowerCase() === comparableName && lib._id.toString() !== excludeLibraryId)) {
      throw new LibraryNameConflictError(`user has already a library with name ${libraryName}`)
    }
  }

  async create (body: NewLibrary, userId: string): Promise<SingleResultObject<LibraryEntity>> {
    await this.checkLibraryNameAvailable(body.name, userId)
    const newLibraryData = {
      ...body,
      name: body.name.trim()
    }
    const newLibrary = await librariesDao.create(newLibraryData, userId)
    return new SingleResultObject(newLibrary)
  }

  async update (id: string, body: Partial<NewLibrary>, userId: string, role: Role): Promise<SingleResultObject<LibraryEntity>> {
    const library = await this.get(id, userId, role)
    if (body.name != null) {
      await this.checkLibraryNameAvailable(body.name, userId, id)
    }

    if (library == null) {
      throw new LibraryNotFoundError('library not found')
    }

    const updatedLibrary = await librariesDao.update(id, body)
    if (updatedLibrary == null) {
      throw new LibraryNotFoundError('library not found')
    }

    return new SingleResultObject(updatedLibrary)
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

  async addBook (libraryId: string, newBookData: NewBook, userId: string): Promise<SingleResultObject<LibraryEntity>> {
    const library = await this.get(libraryId, userId, Role.Regular)
    if (newBookData.isbn13 == null && newBookData.isbn10 == null) {
      throw new BookNotFoundError('isbn13 or isbn10 must be provided')
    }
    const newBookEntity = await booksService.ensureBookExistsInBooks(newBookData)

    const updatedLibrary = await runInTransaction<LibraryEntity>(async (session) => {
      const userBook = await userBooksDao.upsert(libraryId, userId, newBookEntity, session)
      if (userBook == null) throw new UserBookNotFoundError('user book not found')

      if (library.entity.books.includes(userBook.id)) {
        // do nothing else
        // return library.entity
        throw new BookAlreadyExistingInLibrary(`book with id ${newBookEntity.id} already exists in library ${libraryId}`)
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

  async createFromCsv (csvBuffer: Buffer, body: NewLibrary, userId: string): Promise<SingleResultObject<LibraryEntity>> {
    const rawIsbns = parseIsbnColumn(csvBuffer.toString('utf-8'))
    const uniqueIsbns = [...new Set(
      rawIsbns
        .map(isbn => ISBNUtils.sanitizeIsbn(isbn))
        .filter(isbn => ISBNUtils.isValidIsbn10(isbn) || ISBNUtils.isValidIsbn13(isbn))
    )]

    await this.checkLibraryNameAvailable(body.name, userId)
    const library = await librariesDao.create({ ...body, name: body.name.trim() }, userId)

    const addedBookIds = new Set<string>()
    for (const isbn of uniqueIsbns) {
      try {
        let bookEntity = await booksService.fetchByIsbn(isbn)
        if (bookEntity == null) {
          const bookData = await getBookFromSourcesApis(isbn)
          bookEntity = await booksService.ensureBookExistsInBooks(bookData)
        }

        // Deduplicate at book entity level: an isbn10 and its isbn13 equivalent are
        // different strings (both pass the Set above), but resolve to the same BookEntity.
        if (addedBookIds.has(bookEntity.id)) continue
        addedBookIds.add(bookEntity.id)

        const resolvedBook = bookEntity
        await runInTransaction(async (session) => {
          const userBook = await userBooksDao.upsert(library.id, userId, resolvedBook, session)
          if (userBook == null) throw new Error('failed to create user book')
          await librariesDao.addBookIdToLibrary(library.id, userBook.id, session)
        })
      } catch (err) {
        logger.warn(`[ CSV IMPORT ] Failed to process ISBN ${isbn}`, { err })
      }
    }

    const updatedLibrary = await librariesDao.findById(library.id)
    if (updatedLibrary == null) throw new Error('should not happen')
    return new SingleResultObject(updatedLibrary)
  }
}

export default new LibrariesService()
