import { Router } from 'express'
import tryCatch from '../../try-catch.js'
import bodyValidator from '../../middlewares/body-validator.middleware.js'
import { loginSchema } from './auth.schemas.js'
import authService from './auth.service.js'
import { ResultObject } from '../../results.js'
import { HttpStatusCode } from '../../types.js'

const authRouter = Router()

authRouter.post('/', bodyValidator(loginSchema), tryCatch(async (req) => {
  const result = await authService.login(req.body)
  return ResultObject.toFinal(HttpStatusCode.OK, result)
}))

export default authRouter
