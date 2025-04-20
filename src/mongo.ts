import { Db, MongoClient } from 'mongodb'
import config from './config.js'
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import logger from './logger.js'

class Mongo {
  mongoClient!: MongoClient
  memoryReplSet?: MongoMemoryReplSet
  uri!: string

  async start (options: { memory: boolean } = { memory: false }): Promise<void> {
    if (this.mongoClient != null) return
    if (this.uri == null) { // relevant in testing to be able to reuse the mongodb-memory-server (mms). Avoid to instantiate a new mms for each test
      if (options.memory && config.environment === 'test') {
        this.memoryReplSet = await MongoMemoryReplSet.create({ replSet: { count: 3 } })
        this.setUri(this.memoryReplSet.getUri())

        // await while all SECONDARIES will be ready. Required only in testing.
        await this.memoryReplSet.waitUntilRunning()
        // await new Promise((resolve) => setTimeout(resolve, 4000))
      } else {
        this.setUri(config.mongo.uri)
      }
    }

    this.mongoClient = new MongoClient(this.uri, { retryWrites: true, w: 'majority' })

    await this.mongoClient.connect()
    if (config.environment !== 'test') {
      this.mongoClient.on('connectionCreated', (event) => logger.info(`connected mongodb on ${event.address}`))
    }
  }

  setUri (uri: string): void {
    this.uri = uri
  }

  get client (): MongoClient {
    return this.mongoClient
  }

  db (dbName?: string): Db {
    return this.mongoClient.db(dbName)
  }

  async stop (): Promise<void> {
    this.mongoClient.on('connectionClosed', () => logger.info('mongodb connection closed'))
    await this.mongoClient.close()
    if (this.memoryReplSet != null) {
      await this.memoryReplSet.stop({ doCleanup: true })
    }
  }

  async clean (): Promise<void> {
    await this.db().dropDatabase()
  }
}

export default new Mongo()
