import { ulid } from 'ulid'
import Dao from '../../dao.js'
import { isNotNull } from '../../utils.js'
import { DBLibrary, NewLibrary } from './libraries.interfaces.js'
import { LibraryEntity } from './libraries.entity.js'
import { Role } from '../users/users.interfaces.js'
import { ClientSession, Filter } from 'mongodb'
import config from '../../config.js'

function dbLibraryToEntity (dbLibrary: DBLibrary | null): LibraryEntity | null {
  return dbLibrary == null ? null : new LibraryEntity(dbLibrary)
}

function listLibrariesMongoFilter (userId: string, role: Role, search?: string): Filter<DBLibrary> {
  const mongoFilter: Filter<DBLibrary> = role === Role.Regular ? { userId } : {}

  if (search != null) {
    mongoFilter.$text = { $search: search }
  }

  return mongoFilter
}

class LibrariesDao extends Dao<DBLibrary> {
  constructor () {
    super('libraries')
  }

  async init (): Promise<void> {
    if (config.environment !== 'local' && config.environment !== 'test') {
      await this.collection.createSearchIndex({
        name: 'library_search',
        definition: {
          mappings: {
            dynamic: false,
            fields: {
              name: { type: 'string' },
              description: { type: 'string' }
            }
          }
        }
      })
    } else {
      await this.collection.createIndex({ name: 'text', description: 'text' })
    }
  }

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

  async update (id: string, updateData: Partial<NewLibrary>): Promise<LibraryEntity | null> {
    const now = new Date()
    const updateDoc: Partial<DBLibrary> = {
      ...updateData,
      updatedAt: now
    }

    const updatedLibrary = await this.collection.findOneAndUpdate(
      { _id: id },
      { $set: updateDoc },
      { returnDocument: 'after' }
    )

    return dbLibraryToEntity(updatedLibrary)
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

  async list (userId: string, role: Role, skip: number, limit: number, search?: string): Promise<readonly LibraryEntity[]> {
    const mongoFilter = listLibrariesMongoFilter(userId, role, search)
    const dbLibraries = await this.collection.find(mongoFilter)
      .skip(skip)
      .limit(limit)
      .toArray()
    return dbLibraries.map(dbLibrary => dbLibraryToEntity(dbLibrary)).filter(isNotNull)
  }

  async count (userId: string, role: Role, search?: string): Promise<number> {
    const mongoFilter = listLibrariesMongoFilter(userId, role, search)
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

  async removeBookIdFromLibrary (libraryId: string, userBooksId: string): Promise<LibraryEntity | null> {
    const updatedLibrary = await this.collection.findOneAndUpdate(
      { _id: libraryId },
      { $pull: { books: userBooksId } },
      { returnDocument: 'after' }
    )
    return dbLibraryToEntity(updatedLibrary)
  }
}

export default new LibrariesDao()
