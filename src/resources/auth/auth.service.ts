import { TokenResultObject } from '../../results.js'
import bcrypt from 'bcryptjs'
import { Login } from './auth.interfaces.js'
import { InvalidLoginError } from './auth.error.js'
import { makeJwt, makeRefreshToken, getRefreshTokenExpiration, hashRefreshToken } from './auth.utils.js'
import config from '../../config.js'
import usersService from '../users/users.service.js'
import refreshTokensDao from './refresh-tokens.dao.js'
import { ExpiredTokenError, InvalidTokenError } from '../../error/errors.js'

class AuthService {
  async login (body: Login): Promise<TokenResultObject> {
    let user

    try {
      user = await usersService.getByEmail(body.email)
    } catch (error) {
      if (typeof error === 'object' && error != null && 'statusCode' in error && error.statusCode === 404) {
        // do nothing
      } else {
        throw error
      }
    }

    const isPasswordValid = (user != null)
      ? await bcrypt.compare(body.password, user.password)
      : false

    if (user == null || !isPasswordValid) {
      throw new InvalidLoginError('invalid email or password')
    }

    // Generate access token
    const accessToken = makeJwt(user.id, user.role)

    // Generate and store refresh token
    const refreshToken = makeRefreshToken()
    const hashedRefreshToken = hashRefreshToken(refreshToken)
    const expiresAt = getRefreshTokenExpiration()

    await refreshTokensDao.create(hashedRefreshToken, user.id, expiresAt)

    return new TokenResultObject(
      accessToken,
      refreshToken,
      config.refreshToken.cookieOptions
    )
  }

  async refresh (refreshToken: string): Promise<TokenResultObject> {
    const now = new Date()
    const hashedRefreshToken = hashRefreshToken(refreshToken)

    const storedToken = await refreshTokensDao.findByToken(hashedRefreshToken)

    if (storedToken == null) {
      throw new InvalidTokenError('invalid refresh token')
    }

    if (storedToken.revokedAt != null) {
      throw new InvalidTokenError('refresh token revoked')
    }

    if (storedToken.expiresAt <= now) {
      await refreshTokensDao.revokeByTokenHash(hashedRefreshToken)
      throw new ExpiredTokenError('refresh token expired')
    }

    const userResult = await usersService.getById(storedToken.userId)
    const user = userResult.entity

    const accessToken = makeJwt(user.id, user.role)

    return new TokenResultObject(accessToken)
  }

  async logout (refreshToken: string | undefined): Promise<void> {
    if (refreshToken != null) {
      const hashedToken = hashRefreshToken(refreshToken)
      await refreshTokensDao.revokeByTokenHash(hashedToken)
    }
  }

  async logoutAll (userId: string): Promise<void> {
    await refreshTokensDao.revokeByUserId(userId)
  }
}

export default new AuthService()
