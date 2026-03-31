import { Router } from 'express'
import handler from '../../handler.js'
import bodyValidator from '../../middlewares/body-validator.middleware.js'
import { loginSchema } from './auth.schemas.js'
import authService from './auth.service.js'
import { ClearCookieResultObject } from '../../results.js'
import { HttpStatusCode } from '../../types.js'
import { checkJwt } from '../../middlewares/jwt.middleware.js'
import usersService from '../users/users.service.js'
import config from '../../config.js'
import { TokenNotProvidedError } from '../../error/errors.js'

const authRouter = Router()

authRouter.post('/login', bodyValidator(loginSchema), handler(async (req) => {
  const result = await authService.login(req.body)

  return { status: HttpStatusCode.OK, data: result }
}))

authRouter.post('/refresh', handler(async (req) => {
  const refreshToken = req.cookies?.refresh_token

  if (refreshToken == null) {
    throw new TokenNotProvidedError('refresh token not provided')
  }

  const result = await authService.refresh(refreshToken)

  return { status: HttpStatusCode.OK, data: result }
}))

authRouter.post('/logout', handler(async (req) => {
  const refreshToken = req.cookies?.refresh_token
  await authService.logout(refreshToken)

  const clearRefreshToken = new ClearCookieResultObject('refresh_token', config.cookieOptions.refreshToken)

  return { status: HttpStatusCode.NoContent, data: clearRefreshToken }
}))

authRouter.post('/logout-all', checkJwt, handler(async (req) => {
  if (req.userId == null) {
    return { status: HttpStatusCode.NotFound, data: null }
  }

  await authService.logoutAll(req.userId)

  const clearRefreshToken = new ClearCookieResultObject('refresh_token', config.cookieOptions.refreshToken)

  return { status: HttpStatusCode.NoContent, data: clearRefreshToken }
}))

authRouter.get('/me', checkJwt, handler(async (req) => {
  if (req.userId == null) {
    return { status: HttpStatusCode.NotFound, data: null }
  }

  const user = await usersService.getById(req.userId)

  return { status: HttpStatusCode.OK, data: user }
}))

export default authRouter
