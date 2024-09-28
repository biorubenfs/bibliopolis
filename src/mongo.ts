import { Db, MongoClient } from 'mongodb'
import config from './config.js'

class Mongo {
  mongoClient: MongoClient

  constructor (mongoUri: string) {
    this.mongoClient = new MongoClient(mongoUri, { retryWrites: true, w: 'majority' })
  }

  async start (): Promise<MongoClient> {
    await this.mongoClient.connect()

    console.log('connected mongodb')

    return this.mongoClient
  }

  get client (): MongoClient {
    return this.mongoClient
  }

  db (dbName?: string): Db {
    return this.mongoClient.db(dbName)
  }

  async stop (): Promise<void> {
    if (this.mongoClient != null) {
      await this.mongoClient.close()
    }
  }
}

export default new Mongo(config.mongo.uri)
