import { ulid } from 'ulid'
import Dao from '../../dao.js'
import { isNotNull } from '../../utils.js'
import { DBLibrary, NewLibrary } from './libraries.interfaces.js'
import { LibraryEntity } from './libraries.entity.js'
import { Role } from '../users/users.interfaces.js'
import { ClientSession } from 'mongodb'

function dbLibraryToEntity (dbLibrary: DBLibrary | null): LibraryEntity | null {
  return dbLibrary == null ? null : new LibraryEntity(dbLibrary)
}

class LibrariesDao extends Dao<DBLibrary> {
  constructor () {
    super('libraries')
  }

  async init (): Promise<void> { }

  async create (newLibrary: NewLibrary, userId: string): Promise<LibraryEntity> {
    const now = new Date()
    const dbLibrary: DBLibrary = {
      ...newLibrary,
      _id: ulid(),
      books: [],
      userId,
      createdAt: now,
      updatedAt: now
    }

    await this.collection.insertOne(dbLibrary)
    return new LibraryEntity(dbLibrary)
  }

  async findById (id: string): Promise<LibraryEntity | null> {
    const dbLibrary = await this.collection.findOne({ _id: id })

    return dbLibraryToEntity(dbLibrary)
  }

  async findByUserAndName (name: string, userId: string): Promise<LibraryEntity | null> {
    const dbLibrary = await this.collection.findOne({ userId, name })
    return dbLibraryToEntity(dbLibrary)
  }

  async delete (id: string): Promise<void> {
    await this.collection.deleteOne({ _id: id })
  }

  async list (userId: string, role: Role, skip: number, limit: number): Promise<readonly LibraryEntity[]> {
    const mongoFilter = role === Role.Regular ? { userId } : {}
    const dbLibraries = await this.collection.find(mongoFilter)
      .skip(skip)
      .limit(limit)
      .toArray()
    return dbLibraries.map(dbLibrary => dbLibraryToEntity(dbLibrary)).filter(isNotNull)
  }

  async count (userId: string, role: Role): Promise<number> {
    const mongoFilter = role === Role.Regular ? { userId } : {}
    const total = await this.collection.countDocuments(mongoFilter)
    return total
  }

  async addBookIdToLibrary (libraryId: string, bookId: string, session?: ClientSession): Promise<LibraryEntity | null> {
    const updatedLibrary: DBLibrary | null = await this.collection.findOneAndUpdate(
      { _id: libraryId },
      { $push: { books: bookId } },
      { returnDocument: 'after', session })
    return dbLibraryToEntity(updatedLibrary)
  }

  async removeBookIdFromLibrary (libraryId: string, bookId: string): Promise<LibraryEntity | null> {
    const updatedLibrary = await this.collection.findOneAndUpdate(
      { _id: libraryId },
      { $pull: { books: bookId } },
      { returnDocument: 'after' }
    )
    return dbLibraryToEntity(updatedLibrary)
  }
}

export default new LibrariesDao()
