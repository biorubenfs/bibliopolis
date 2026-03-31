import { TokenResultObject } from '../../results.js'
import bcrypt from 'bcryptjs'
import { Login } from './auth.interfaces.js'
import { InvalidLoginError } from './auth.error.js'
import { makeJwt, makeRefreshToken, getRefreshTokenExpiration } from './auth.utils.js'
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

    const isPasswordValid = (user != null) ? bcrypt.compareSync(body.password, user.password) : false

    if (user == null || !isPasswordValid) {
      throw new InvalidLoginError('invalid email or password')
    }

    // Generate access token
    const accessToken = makeJwt(user.id, user.role)

    // Generate and store refresh token
    const refreshToken = makeRefreshToken()
    const expiresAt = getRefreshTokenExpiration()
    await refreshTokensDao.create(refreshToken, user.id, expiresAt)

    return new TokenResultObject(
      accessToken,
      refreshToken,
      config.cookieOptions.refreshToken
    )
  }

  async refresh (refreshToken: string): Promise<TokenResultObject> {
    // Find refresh token in database
    const storedToken = await refreshTokensDao.findByToken(refreshToken)

    if (storedToken == null) {
      throw new InvalidTokenError('invalid refresh token')
    }

    // Check if token is valid (active and not expired)
    if (!storedToken.isValid()) {
      await refreshTokensDao.revokeByToken(refreshToken)
      throw new ExpiredTokenError('refresh token expired or revoked')
    }

    // Get user to generate new access token
    const userResult = await usersService.getById(storedToken.userId)
    const user = userResult.entity

    // Generate new access token
    const accessToken = makeJwt(user.id, user.role)

    // Token rotation: revoke old token and create new one
    await refreshTokensDao.revokeByToken(refreshToken)
    const newRefreshToken = makeRefreshToken()
    const expiresAt = getRefreshTokenExpiration()
    await refreshTokensDao.create(newRefreshToken, user.id, expiresAt)

    return new TokenResultObject(
      accessToken,
      newRefreshToken,
      config.cookieOptions.refreshToken
    )
  }

  async logout (refreshToken: string | undefined): Promise<void> {
    if (refreshToken != null) {
      await refreshTokensDao.revokeByToken(refreshToken)
    }
  }

  async logoutAll (userId: string): Promise<void> {
    await refreshTokensDao.revokeByUserId(userId)
  }
}

export default new AuthService()
