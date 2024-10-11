import path from 'path/posix'
import { readFileSync } from 'fs'
import booksDao from '../../resources/books/books.dao.js'
import usersDao from '../../resources/users/users.dao.js'
import { Collection, Document } from 'mongodb'
import librariesBooksDao from '../../resources/libraries-books/libraries-books.dao.js'
import librariesDao from '../../resources/libraries/libraries.dao.js'

const MOCK_DATA_DIR_PATH = new URL(path.join('../../../data/test-mock-data'), import.meta.url)

async function loadDataInDb<T extends Document> (fileName: string, collection: Collection<T>, dirPath: URL = MOCK_DATA_DIR_PATH): Promise<void> {
  const filePath = path.join(dirPath.pathname, fileName)
  const file = readFileSync(filePath, 'utf8')
  await collection.insertMany(JSON.parse(file))
}

async function loadBooksInDB (): Promise<void> { await loadDataInDb('books.json', booksDao.collection) }
async function loadUsersInDB (): Promise<void> { await loadDataInDb('users.json', usersDao.collection) }
async function loadLibrariesInDB (): Promise<void> { await loadDataInDb('libraries.json', librariesDao.collection) }
async function loadLibrariesBooksInDB (): Promise<void> { await loadDataInDb('libraries-books.json', librariesBooksDao.collection) }

const mockDbData = { loadBooksInDB, loadUsersInDB, loadLibrariesInDB, loadLibrariesBooksInDB }

export default mockDbData
