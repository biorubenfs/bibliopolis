import jwt from 'jsonwebtoken'
import config from '../../config.js'
import { Role } from '../users/users.interfaces.js'
import crypto from 'crypto'

export function makeJwt (userId: string, role: Role): string {
  const { secret, accessTokenExpiration } = config.jwt
  const token = jwt.sign({
    id: userId,
    role
  }, secret, { expiresIn: accessTokenExpiration }
  )

  return token
}

/**
 * Generates an opaque (non-JWT) refresh token.
 * This is a random 128-character hex string stored in the database.
 * Opaque tokens are preferred over JWT refresh tokens because:
 * - True revocation: can be invalidated in DB immediately
 * - Audit trail: can track usage and revocation history
 * - No signature verification needed: validated by DB lookup
 */
export function makeRefreshToken (): string {
  return crypto.randomBytes(64).toString('hex')
}

export function getRefreshTokenExpiration (): Date {
  const { refreshTokenExpiration } = config.jwt
  const ms = parseExpiration(refreshTokenExpiration)
  return new Date(Date.now() + ms)
}

function parseExpiration (expiration: string): number {
  const units: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  }

  const match = expiration.match(/^(\d+)([smhd])$/)
  if (match == null) {
    throw new Error(`Invalid expiration format: ${expiration}`)
  }

  const value = parseInt(match[1])
  const unit = match[2]
  return value * units[unit]
}
