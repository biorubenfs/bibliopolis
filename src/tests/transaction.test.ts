import { describe, beforeAll, afterAll, it, expect } from 'vitest'

import { Db, Collection } from 'mongodb'
import mongo from '../mongo.js'
import { runInTransaction } from '../transaction-helper.js'

let db: Db
let testCollection: Collection

describe('mongodb transaction tests', () => {
  beforeAll(async () => {
    await mongo.start({ memory: true })
    db = mongo.db('test-db')
    testCollection = db.collection('test_collection')
  })

  afterAll(async () => {
    await mongo.stop()
  })

  it('should commit successful transaction', async () => {
    await runInTransaction(async (session) => {
      const result = await testCollection.insertOne({ name: 'Alice' }, { session })
      return result
    })

    const result = await testCollection.findOne({ name: 'Alice' })
    expect(result).toBeTruthy()
    expect(result?.name).toBe('Alice')
  })

  it('should rollback transaction on error', async () => {
    try {
      await runInTransaction(async (session) => {
        await testCollection.insertOne({ name: 'Bob' }, { session })
        throw new Error('Force rollback')
      })
    } catch (_) {
      // expected
    }

    const result = await testCollection.findOne({ name: 'Bob' })
    expect(result).toBeNull()
  })
})
