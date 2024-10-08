import { CollectionResultObject, SingleResultObject } from '../../results.js'
import booksService from '../books/books.service.js'
import { LibraryEntity } from '../libraries/libraries.entity.js'
import librariesService from '../libraries/libraries.service.js'
import { Role } from '../users/users.interfaces.js'
import librariesBooksDao from './libraries-books.dao.js'
import { LibraryBookEntity } from './libraries-books.entity.js'
import { NewLibraryBook } from './libraries-books.interfaces.js'

class LibrariesBooksService {
  async list (libraryId: string): Promise<CollectionResultObject<LibraryBookEntity>> {
    const librariesBooks = await librariesBooksDao.list(libraryId)

    const mockPaginationObject = { page: { skip: 0, limit: 0 }, total: 0 }
    return new CollectionResultObject(librariesBooks, mockPaginationObject)
  }

  async create (libraryId: string, bookId: string, userId: string): Promise<SingleResultObject<LibraryEntity>> {
    const library = await librariesService.get(libraryId, userId, Role.Regular)
    const book = await booksService.getById(bookId)

    const libraryBook: NewLibraryBook = {
      libraryId: library.entity.id,
      userId,
      bookTitle: book.entity.title,
      bookAuthors: book.entity.authors,
      bookId: book.entity.id
    }

    await librariesBooksDao.create(libraryBook)
    const updatedLibrary = await librariesService.addBookToLibrary(libraryId, bookId)

    return new SingleResultObject(updatedLibrary)
  }
}

export default new LibrariesBooksService()
