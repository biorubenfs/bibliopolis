import Dao from '../../dao.js'
import { DBRefreshToken } from './auth.interfaces.js'
import { RefreshTokenEntity } from './refresh-tokens.entity.js'
import { ulid } from 'ulid'

function dbRefreshTokenToEntity (dbToken: DBRefreshToken | null): RefreshTokenEntity | null {
  return dbToken != null ? new RefreshTokenEntity(dbToken) : null
}

class RefreshTokensDao extends Dao<DBRefreshToken> {
  constructor () {
    super('refresh_tokens')
  }

  async init (): Promise<void> {
    // TTL index: mongodb automatically deletes documents when expiresAt < now
    await this.collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })

    // Unique index on tokenHash: prevents duplicate tokens (security)
    await this.collection.createIndex(
      { tokenHash: 1 },
      { unique: true }
    )

    // Compound index for queries by userId and isActive
    await this.collection.createIndex({ userId: 1, isActive: 1 })
  }

  async create (tokenHash: string, userId: string, expiresAt: Date): Promise<RefreshTokenEntity> {
    const now = new Date()

    const dbToken: DBRefreshToken = {
      _id: ulid(),
      tokenHash,
      userId,
      expiresAt,
      createdAt: now,
      revokedAt: null
    }

    await this.collection.insertOne(dbToken)

    return new RefreshTokenEntity(dbToken)
  }

  async findByToken (tokenHash: string): Promise<RefreshTokenEntity | null> {
    const doc = await this.collection.findOne({ tokenHash })

    return dbRefreshTokenToEntity(doc)
  }

  async revokeByTokenHash (tokenHash: string): Promise<void> {
    await this.collection.updateOne(
      { tokenHash },
      {
        $set: {
          revokedAt: new Date()
        }
      }
    )
  }

  async revokeByUserId (userId: string): Promise<void> {
    await this.collection.updateMany(
      { userId },
      {
        $set: {
          revokedAt: new Date()
        }
      }
    )
  }

  async consumeForRotation (tokenHash: string, now: Date): Promise<boolean> {
    const result = await this.collection.updateOne(
      { tokenHash, revokedAt: null, expiresAt: { $gt: now } },
      { $set: { revokedAt: now } }
    )

    return result.modifiedCount === 1
  }
}

export default new RefreshTokensDao()
