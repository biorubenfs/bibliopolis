import { Router } from 'express'
import userBooksService from './user-books.service.js'
import bodyValidator from '../../middlewares/body-validator.middleware.js'
import tryCatch from '../../try-catch.js'
import { HttpStatusCode } from '../../types.js'
import { userBookUpdateSchema } from './user-books.schemas.js'
import { queryPaginationValidator } from '../../middlewares/pagination-validator.middleware.js'
import { ensureArray, parseSkipLimitQP } from '../../utils.js'
import { Role } from '../users/users.interfaces.js'

const userBooksRouter = Router()

userBooksRouter.get('/', queryPaginationValidator, tryCatch(async (req) => {
  const librariesIds = ensureArray(req.query.libraries as string | string[] | null)
  const result = await userBooksService.list(parseSkipLimitQP(req), req.userId ?? '', req.role ?? Role.Regular, { userId: req.query.userId as string, librariesIds: librariesIds ?? undefined })
  return { status: HttpStatusCode.OK, data: result }
}))

userBooksRouter.get('/:bookId', tryCatch(async (req) => {
  const result = await userBooksService.get(req.params.bookId, req.userId ?? '')
  return { status: HttpStatusCode.OK, data: result }
}))

userBooksRouter.patch('/:bookId', bodyValidator(userBookUpdateSchema), tryCatch(async (req) => {
  const result = await userBooksService.update(req.params.bookId, req.userId ?? '', req.body)
  return { status: HttpStatusCode.OK, data: result }
}))

export default userBooksRouter
