import path from 'path/posix'
import { readFileSync } from 'fs'
import booksDao from '../resources/books/books.dao.js'
import usersDao from '../resources/users/users.dao.js'
import { Collection, Document } from 'mongodb'

const MOCK_DATA_DIR_PATH = new URL(path.join('../../data/test-mock-data'), import.meta.url)

async function loadDataInDb<T extends Document> (fileName: string, collection: Collection<T>, dirPath: URL = MOCK_DATA_DIR_PATH): Promise<void> {
  const filePath = path.join(dirPath.pathname, fileName)
  const file = readFileSync(filePath, 'utf8')
  await collection.insertMany(JSON.parse(file))
}

async function loadBooksInDB (): Promise<void> { await loadDataInDb('books.json', booksDao.collection) }
async function loadUsersInDB (): Promise<void> { await loadDataInDb('users.json', usersDao.collection) }

const mockDbData = { loadBooksInDB, loadUsersInDB }

export default mockDbData
