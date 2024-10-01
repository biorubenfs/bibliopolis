import { Db, MongoClient } from 'mongodb'
import config from './config.js'
import { MongoMemoryReplSet } from 'mongodb-memory-server'

// class Mongo {
//   mongoClient!: MongoClient
//   memoryReplSet?: MongoMemoryReplSet
//   uri!: string

//   async start (): Promise<void> {
//     if (config.environment === 'test') {
//       this.memoryReplSet = await MongoMemoryReplSet.create({ replSet: { count: 3 } })
//       this.uri = this.memoryReplSet.getUri()

//       // await while all SECONDARIES will be ready. Required only in testing.
//       await new Promise((resolve) => setTimeout(resolve, 2500))
//     } else {
//       this.uri = config.mongo.uri
//     }

//     this.mongoClient = new MongoClient(this.uri, { retryWrites: true, w: 'majority' })

//     await this.mongoClient.connect()

//     console.log('connected mongodb')
//   }

//   get client (): MongoClient {
//     return this.mongoClient
//   }

//   db (dbName?: string): Db {
//     return this.mongoClient.db(dbName)
//   }

//   async stop (): Promise<void> {
//     await this.mongoClient.close()
//     if (this.memoryReplSet != null) {
//       await this.memoryReplSet.stop()
//     }
//   }
// }

// export default new Mongo()

class Mongo {
  mongoClient: MongoClient
  memoryReplSet!: MongoMemoryReplSet

  constructor (mongoUri: string) {
    this.mongoClient = new MongoClient(mongoUri, { retryWrites: true, w: 'majority' })
  }

  async start(): Promise<MongoClient> {
    if (config.environment === "test") {
      this.memoryReplSet = await MongoMemoryReplSet.create({ replSet: { count: 3 } })
      this.mongoClient = await MongoClient.connect(this.memoryReplSet.getUri(), { retryWrites: true, w: 'majority' })

      // await while all SECONDARIES will be ready. Required only in testing.
      await new Promise((resolve) => setTimeout(resolve, 2500))
    } else {
      await this.mongoClient.connect()
    }

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
    await this.mongoClient.close()
    if (this.memoryReplSet != null) {
      await this.memoryReplSet.stop()
    }
  }
}

export default new Mongo(config.mongo.uri)
