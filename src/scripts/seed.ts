import path from "path";
import { Collection } from "mongodb";
import { readFileSync } from "fs";
import { getMockDataSetParams, MockDataSet } from "../tests/utils/data.js";
import mongo from "../mongo.js";

const SEED_DATA_DIR_PATH = new URL(path.join('../../data/seed'), import.meta.url)

console.log(SEED_DATA_DIR_PATH)


async function insertDataInDb<T extends Document>(filename: string, collection: Collection<T>, dirPath: URL = SEED_DATA_DIR_PATH): Promise<void> {
  const filePath = path.join(dirPath.pathname, filename)
  const file = readFileSync(filePath, 'utf8')
  console.log('reading ', filePath)
  await collection.insertMany(JSON.parse(file))
}


async function loadSeedDataInDb(...mockDataSets: MockDataSet[]): Promise<void> {
  await Promise.all(mockDataSets.map(async (mockDataSet) => {
    const { filename, collection } = getMockDataSetParams(mockDataSet)
    await insertDataInDb(filename, collection)
  })
  )
}

async function seedDatabase(): Promise<void> {
  await mongo.start()

  await loadSeedDataInDb(MockDataSet.Books, MockDataSet.Libraries, MockDataSet.LibrariesBooks, MockDataSet.Users)

  await mongo.stop()
}

await seedDatabase()
