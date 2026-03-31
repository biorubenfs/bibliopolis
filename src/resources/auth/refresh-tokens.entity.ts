import { Entity, EntityType } from '../../entity.js'
import { DBRefreshToken } from './auth.interfaces.js'

export class RefreshTokenEntity extends Entity<EntityType.RefreshTokens> {
  readonly token: string
  readonly userId: string
  readonly expiresAt: Date
  readonly createdAt: Date
  readonly isActive: boolean
  readonly revokedAt: Date | null

  constructor (data: DBRefreshToken) {
    super(EntityType.RefreshTokens, data._id)
    this.token = data.token
    this.userId = data.userId
    this.expiresAt = data.expiresAt
    this.createdAt = data.createdAt
    this.isActive = data.isActive
    this.revokedAt = data.revokedAt
  }

  attributes (): object {
    return {
      token: this.token,
      userId: this.userId,
      expiresAt: this.expiresAt,
      createdAt: this.createdAt,
      isActive: this.isActive,
      revokedAt: this.revokedAt
    }
  }

  isExpired (): boolean {
    return this.expiresAt < new Date()
  }

  isValid (): boolean {
    return this.isActive && !this.isExpired()
  }
}
