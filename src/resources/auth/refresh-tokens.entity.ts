import { Entity, EntityType } from '../../entity.js'
import { DBRefreshToken } from './auth.interfaces.js'

export class RefreshTokenEntity extends Entity<EntityType.RefreshTokens> {
  readonly tokenHash: string
  readonly userId: string
  readonly expiresAt: Date
  readonly createdAt: Date
  readonly revokedAt: Date | null

  constructor (data: DBRefreshToken) {
    super(EntityType.RefreshTokens, data._id)
    this.tokenHash = data.tokenHash
    this.userId = data.userId
    this.expiresAt = data.expiresAt
    this.createdAt = data.createdAt
    this.revokedAt = data.revokedAt
  }

  attributes (): object {
    return {
      tokenHash: this.tokenHash,
      userId: this.userId,
      expiresAt: this.expiresAt,
      createdAt: this.createdAt,
      revokedAt: this.revokedAt
    }
  }

  isExpired (): boolean {
    return this.expiresAt < new Date()
  }

  isRevoked (): boolean {
    return this.revokedAt != null
  }

  isValid (): boolean {
    return !this.isRevoked() && !this.isExpired()
  }
}
