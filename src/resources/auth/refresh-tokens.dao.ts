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

    // Unique index on token: prevents duplicate tokens (security)
    await this.collection.createIndex(
      { token: 1 },
      { unique: true }
    )

    // Compound index for queries by userId and isActive
    await this.collection.createIndex({ userId: 1, isActive: 1 })
  }

  async create (token: string, userId: string, expiresAt: Date): Promise<RefreshTokenEntity> {
    const now = new Date()

    const dbToken: DBRefreshToken = {
      _id: ulid(),
      token,
      userId,
      expiresAt,
      createdAt: now,
      isActive: true,
      revokedAt: null
    }

    await this.collection.insertOne(dbToken)

    return new RefreshTokenEntity(dbToken)
  }

  async findByToken (token: string): Promise<RefreshTokenEntity | null> {
    const doc = await this.collection.findOne({ token, isActive: true })

    return dbRefreshTokenToEntity(doc)
  }

  async revokeByToken (token: string): Promise<void> {
    await this.collection.updateOne(
      { token },
      { $set: { isActive: false, revokedAt: new Date() } }
    )
  }

  async revokeByUserId (userId: string): Promise<void> {
    await this.collection.updateMany(
      { userId, isActive: true },
      { $set: { isActive: false, revokedAt: new Date() } }
    )
  }
}

export default new RefreshTokensDao()
