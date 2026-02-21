import { Router } from 'express'
import usersService from './users.service.js'
import tryCatch from '../../try-catch.js'
import bodyValidator from '../../middlewares/body-validator.middleware.js'
import { createUserSchema, updatePasswordSchema, updateUserSchema } from './users.schemas.js'
import { checkAdmin, checkJwt } from '../../middlewares/jwt.middleware.js'
import { queryPaginationValidator } from '../../middlewares/pagination-validator.middleware.js'
import { parseSkipLimitQP } from '../../utils.js'
import { HttpStatusCode } from '../../types.js'
import { RedirectResultObject, SingleResultObject } from '../../results.js'

const usersRouter = Router()

usersRouter.post('/', checkAdmin, bodyValidator(createUserSchema), tryCatch(async (req) => {
  const result = await usersService.signup(req.body)
  return { status: HttpStatusCode.Created, data: new SingleResultObject(result) }
}))

/* maybe we could remove this service because is redundante with auth/me service */
usersRouter.get('/me', tryCatch(async (req) => {
  const result = await usersService.getById(req.userId ?? '')
  return { status: HttpStatusCode.OK, data: result }
}))

usersRouter.get('/', checkAdmin, queryPaginationValidator, tryCatch(async (req) => {
  const result = await usersService.list(parseSkipLimitQP(req))
  return { status: HttpStatusCode.OK, data: result }
}))

usersRouter.patch('/me/password', bodyValidator(updatePasswordSchema), tryCatch(async (req) => {
  const result = await usersService.updatePassword(req.userId ?? '', req.body.currentPassword, req.body.newPassword)
  return { status: HttpStatusCode.OK, data: result }
}))

usersRouter.patch('/me', bodyValidator(updateUserSchema), tryCatch(async (req) => {
  const result = await usersService.updateUser(req.userId ?? '', req.body)
  return { status: HttpStatusCode.OK, data: result }
}))

usersRouter.get('/:id', tryCatch(async (req) => {
  const code = req.query.code as string
  const userId = req.params.id

  if (code == null) {
    throw new Error('no validation code provided')
  }
  await usersService.validate(userId, code)

  // Redirect to the login page after successful validation
  // TODO: replace with a proper URL
  const result = new RedirectResultObject('')

  return { status: HttpStatusCode.Redirect, data: result }
}))

export default usersRouter
