import { ulid } from 'ulid'
import Dao from '../../dao.js'
import { isNotNull } from '../../utils.js'
import { DBLibraryBook, NewLibraryBook } from './libraries-books.interfaces.js'
import { LibraryBookEntity } from './libraries-books.entity.js'

function dbLibraryBookToEntity(dbLibraryBook: DBLibraryBook | null): LibraryBookEntity | null {
    return dbLibraryBook == null ? null : new LibraryBookEntity(dbLibraryBook)
}

class LibrariesBookDao extends Dao<DBLibraryBook> {
    constructor() {
        super('libraries_books')
    }

    async create(newLibraryBook: NewLibraryBook): Promise<LibraryBookEntity> {
        const now = new Date()
        const dbLibraryBook: DBLibraryBook = {
            ...newLibraryBook,
            _id: ulid(),
            addedAt: now,
            updatedAt: now
        }

        await this.collection.insertOne(dbLibraryBook)

        return new LibraryBookEntity(dbLibraryBook)
    }

    async list(libraryId: string): Promise<readonly LibraryBookEntity[]> {
        const dbLibrariesBooks = await this.collection.find({ libraryId: libraryId }).toArray()
        
        return dbLibrariesBooks.map(dbLibraryBookToEntity).filter(isNotNull)
    }
}

export default new LibrariesBookDao()
