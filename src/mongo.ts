import { Db, MongoClient } from 'mongodb'
import config from './config.js'
import { MongoMemoryReplSet } from 'mongodb-memory-server'

class Mongo {
  mongoClient!: MongoClient
  memoryReplSet?: MongoMemoryReplSet
  uri!: string

  async start (): Promise<void> {
    if (config.environment === 'test') {
      this.memoryReplSet = await MongoMemoryReplSet.create({ replSet: { count: 3 } , instanceOpts: [{storageEngine: 'wiredTiger'}]})
      this.uri = this.memoryReplSet.getUri()

      console.log(`Generated Mongo URI: ${this.uri}`)

      // await while all SECONDARIES will be ready. Required only in testing.
      await new Promise((resolve) => setTimeout(resolve, 10000))
    } else {
      this.uri = config.mongo.uri
    }

    console.log(this.uri)
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
      await this.memoryReplSet.stop()
    }
  }
}

export default new Mongo()
