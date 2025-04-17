import { Router } from 'express'
import tryCatch from '../../try-catch.js'
import bodyValidator from '../../middlewares/body-validator.middleware.js'
import { loginSchema, signupSchema } from './auth.schemas.js'
import authService from './auth.service.js'
import { ClearCookieResultObject } from '../../results.js'
import { HttpStatusCode } from '../../types.js'

const authRouter = Router()

authRouter.post('/signup', bodyValidator(signupSchema), tryCatch(async (req) => {
  const result = await authService.signup(req.body)

  return { status: HttpStatusCode.Created, data: result }
}))

authRouter.post('/login', bodyValidator(loginSchema), tryCatch(async (req) => {
  const result = await authService.login(req.body)

  return { status: HttpStatusCode.OK, data: result }
}))

authRouter.post('/logout', tryCatch(async () => {
  const result = new ClearCookieResultObject('access_token', {})

  return { status: HttpStatusCode.NoContent, data: result }
}))

export default authRouter
