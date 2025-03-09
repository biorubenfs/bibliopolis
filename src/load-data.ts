import { Collection } from 'mongodb'
import booksDao from './resources/books/books.dao.js'
import librariesBooksDao from './resources/libraries-books/libraries-books.dao.js'
import librariesDao from './resources/libraries/libraries.dao.js'
import usersDao from './resources/users/users.dao.js'
import { readFileSync } from 'fs'
import path from 'path'

export enum MockDataSet {
  Books = 'books',
  Libraries = 'libraries',
  Users = 'users',
  LibrariesBooks = 'libraries-books'
}

export enum DataSetType {
  Test = 'test',
  Seed = 'seed'
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
      neverReached(data)
    }
  }
}

async function insertDataInDb<T extends Document> (filename: string, collection: Collection<T>, dirPath: URL): Promise<void> {
  const filePath = path.join(dirPath.pathname, filename)
  const file = readFileSync(filePath, 'utf8')
  await collection.insertMany(JSON.parse(file))
}

export async function loadDataInDb (dataSetType: DataSetType, ...mockDataSets: MockDataSet[]): Promise<void> {
  const DIR_PATH = dataSetType === DataSetType.Test
    ? new URL(path.join('../data/test-mock-data'), import.meta.url)
    : new URL(path.join('../data/seed'), import.meta.url)

  await Promise.all(mockDataSets.map(async (mockDataSet) => {
    const { filename, collection } = getMockDataSetParams(mockDataSet)
    await insertDataInDb(filename, collection, DIR_PATH)
  })
  )
}
