import { Router } from 'express'
import usersService from './users.service.js'
import tryCatch from '../../try-catch.js'
import bodyValidator from '../../middlewares/body-validator.middleware.js'
import { createUserSchema } from './users.schemas.js'
import { checkAdmin, checkJwt } from '../../middlewares/jwt.middleware.js'
import { queryPaginationValidator } from '../../middlewares/pagination-validator.middleware.js'
import { parseSkipLimitQP } from '../../utils.js'
import { ResultObject } from '../../results.js'
import { HttpStatusCode } from '../../types.js'

const usersRouter = Router()

usersRouter.post('/', bodyValidator(createUserSchema), tryCatch(async (req) => {
  const result = await usersService.signup(req.body)
  return ResultObject.toFinal(HttpStatusCode.Created, result)
}))

usersRouter.get('/me', checkJwt, tryCatch(async (req) => {
  const result = await usersService.getById(req.userId ?? '')
  return ResultObject.toFinal(HttpStatusCode.OK, result)
}))

usersRouter.get('/', checkJwt, checkAdmin, queryPaginationValidator, tryCatch(async (req) => {
  const result = await usersService.list(parseSkipLimitQP(req))
  return ResultObject.toFinal(HttpStatusCode.OK, result)
}))

export default usersRouter
