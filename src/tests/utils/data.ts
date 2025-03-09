import path from 'path/posix'
import { readFileSync } from 'fs'
import usersDao from '../../resources/users/users.dao.js'
import { Collection, Document } from 'mongodb'
import booksDao from '../../resources/books/books.dao.js'
import librariesDao from '../../resources/libraries/libraries.dao.js'
import librariesBooksDao from '../../resources/libraries-books/libraries-books.dao.js'

const MOCK_DATA_DIR_PATH = new URL(path.join('../../../data/test-mock-data'), import.meta.url)

export enum TESTS_PORTS {
  INIT_PORT = 3001,
  AUTH_PORT = 3002,
  USERS_PORT = 3003,
  BOOKS_PORT = 3004,
  LIBRARIES_PORT = 3005,
}

export enum MockDataSet {
  Books = 'books',
  Libraries = 'libraries',
  Users = 'users',
  LibrariesBooks = 'libraries-books'
}

function neverReached (param: never): never {
  throw new Error(`Unhandled case: ${String(param)}`)
}

export function getMockDataSetParams (data: MockDataSet): { filename: string, collection: Collection<any> } {
  const filename = data.concat('.json')
  switch (data) {
    case MockDataSet.Users:
      return {
        filename,
        collection: usersDao.collection
      }
    case MockDataSet.Libraries:
      return {
        filename,
        collection: librariesDao.collection
      }
    case MockDataSet.Books:
      return {
        filename,
        collection: booksDao.collection
      }
    case MockDataSet.LibrariesBooks:
      return {
        filename,
        collection: librariesBooksDao.collection
      }
    default: {
      // const guard: never = data
      // throw new Error(`handled case ${String(guard)}`)
      neverReached(data)
    }
  }
}

async function insertDataInDb<T extends Document> (filename: string, collection: Collection<T>, dirPath: URL = MOCK_DATA_DIR_PATH): Promise<void> {
  const filePath = path.join(dirPath.pathname, filename)
  const file = readFileSync(filePath, 'utf8')
  await collection.insertMany(JSON.parse(file))
}

/* previous
async function loadBooksInDB (): Promise<void> { await loadDataInDb('books.json', booksDao.collection) }
async function loadUsersInDB (): Promise<void> { await loadDataInDb('users.json', usersDao.collection) }
async function loadLibrariesInDB (): Promise<void> { await loadDataInDb('libraries.json', librariesDao.collection) }
async function loadLibrariesBooksInDB (): Promise<void> { await loadDataInDb('libraries-books.json', librariesBooksDao.collection) }
*/

export async function loadDataInDb (...mockDataSets: MockDataSet[]): Promise<void> {
  await Promise.all(mockDataSets.map(async (mockDataSet) => {
    const { filename, collection } = getMockDataSetParams(mockDataSet)
    await insertDataInDb(filename, collection)
  })
  )
}
