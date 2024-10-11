import { Db, MongoClient } from 'mongodb'
import config from './config.js'
import { MongoMemoryReplSet } from 'mongodb-memory-server'

class Mongo {
  mongoClient!: MongoClient
  memoryReplSet?: MongoMemoryReplSet
  uri!: string

  async start (): Promise<void> {
    if (config.environment === 'test') {
      this.memoryReplSet = await MongoMemoryReplSet.create({ replSet: { count: 3 } })
      this.uri = this.memoryReplSet.getUri()

      // await while all SECONDARIES will be ready. Required only in testing.
      await new Promise((resolve) => setTimeout(resolve, 4000))
    } else {
      this.uri = config.mongo.uri
    }

    this.mongoClient = new MongoClient(this.uri, { retryWrites: true, w: 'majority' })

    await this.mongoClient.connect()

    console.log('connected mongodb')
  }

  get client (): MongoClient {
    return this.mongoClient
  }

  db (dbName?: string): Db {
    return this.mongoClient.db(dbName)
  }

  async stop (): Promise<void> {
    await this.mongoClient.close()
    if (this.memoryReplSet != null) {
      await this.memoryReplSet.stop({ doCleanup: true })
    }
  }
}

export default new Mongo()
