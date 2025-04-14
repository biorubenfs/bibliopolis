import { ClientSession } from 'mongodb'
import mongo from './mongo.js'

type TransactionFunction<T> = (session: ClientSession) => Promise<T>

export async function runInTransaction<T> (fn: TransactionFunction<T>): Promise<T> {
  const session = mongo.client.startSession()

  try {
    const result = await session.withTransaction(async () => await fn(session), {
      readConcern: { level: 'local' },
      writeConcern: { w: 'majority' }
    })

    if (result === undefined || result === null) {
      throw new Error('transaction aborted or returned null')
    }

    return result
  } finally {
    await session.endSession()
  }
}
