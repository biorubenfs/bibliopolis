import { Router } from 'express'
import handler from '../../handler.js'
import bodyValidator from '../../middlewares/body-validator.middleware.js'
import { loginSchema } from './auth.schemas.js'
import authService from './auth.service.js'
import { ClearCookieResultObject } from '../../results.js'
import { HttpStatusCode } from '../../types.js'
import { checkJwt } from '../../middlewares/jwt.middleware.js'
import usersService from '../users/users.service.js'

const authRouter = Router()

// authRouter.post('/signup', bodyValidator(signupSchema), handler(async (req) => {
//   const result = await authService.signup(req.body)

//   return { status: HttpStatusCode.Created, data: result }
// }))

authRouter.post('/login', bodyValidator(loginSchema), handler(async (req) => {
  const result = await authService.login(req.body)

  return { status: HttpStatusCode.OK, data: result }
}))

authRouter.post('/logout', handler(async () => {
  const result = new ClearCookieResultObject('access_token', {})

  return { status: HttpStatusCode.NoContent, data: result }
}))

authRouter.get('/me', checkJwt, handler(async (req) => {
  if (req.userId == null) {
    return { status: HttpStatusCode.NotFound, data: null }
  }

  const user = await usersService.getById(req.userId)

  return { status: HttpStatusCode.OK, data: user }
}))

export default authRouter
