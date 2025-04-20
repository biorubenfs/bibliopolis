import { Router } from 'express'
import tryCatch from '../../try-catch.js'
import bodyValidator from '../../middlewares/body-validator.middleware.js'
import { checkJwt } from '../../middlewares/jwt.middleware.js'

import { bookdIdSchema, newLibrarySchema } from './libraries.schemas.js'
import librariesService from './libraries.service.js'
import { Role } from '../users/users.interfaces.js'
import userBooksService from '../user-books/user-books.service.js'
import { queryPaginationValidator } from '../../middlewares/pagination-validator.middleware.js'
import { parseSkipLimitQP } from '../../utils.js'
import { HttpStatusCode } from '../../types.js'

const librariesRouter = Router()

librariesRouter.post('/', bodyValidator(newLibrarySchema), checkJwt, tryCatch(async (req) => {
  const result = await librariesService.create(req.body, req.userId ?? '')
  return { status: HttpStatusCode.Created, data: result }
}))

librariesRouter.get('/:id', tryCatch(async (req) => {
  const result = await librariesService.get(req.params.id, req.userId ?? '', req.role ?? Role.Regular)
  return { status: HttpStatusCode.OK, data: result }
}))

librariesRouter.get('/', queryPaginationValidator, tryCatch(async (req) => {
  const search = req.query.search
  console.log(search)
  const result = await librariesService.list(req.userId ?? '', req.role ?? Role.Regular, parseSkipLimitQP(req), search as string)
  return { status: HttpStatusCode.OK, data: result }
}))

librariesRouter.delete('/:id', checkJwt, tryCatch(async (req) => {
  await librariesService.delete(req.params.id, req.userId ?? '', req.role ?? Role.Regular)
  return { status: HttpStatusCode.NoContent, data: null }
}))

librariesRouter.post('/:id/books', bodyValidator(bookdIdSchema), tryCatch(async (req) => {
  const result = await librariesService.addBook(req.params.id, req.body.id, req.userId ?? '')
  return { status: HttpStatusCode.Created, data: result }
}))

librariesRouter.delete('/:id/books', bodyValidator(bookdIdSchema), tryCatch(async (req) => {
  const result = await librariesService.removeBook(req.params.id, req.body.id, req.userId ?? '')
  return { status: HttpStatusCode.NoContent, data: result }
}))

// Libraries-books
librariesRouter.get('/:id/books', queryPaginationValidator, tryCatch(async (req) => {
  const result = await userBooksService.list(req.params.id, req.userId ?? '', parseSkipLimitQP(req))
  return { status: HttpStatusCode.OK, data: result }
}))

export default librariesRouter
