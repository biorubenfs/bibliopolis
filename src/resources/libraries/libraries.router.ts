import { Router } from 'express'
import tryCatch from '../../try-catch.js'
import bodyValidator from '../../middlewares/body-validator.middleware.js'
import { checkJwt } from '../../middlewares/jwt.middleware.js'

import { bookdIdSchema, newLibrarySchema } from './libraries.schemas.js'
import librariesService from './libraries.service.js'
import { Role } from '../users/users.interfaces.js'
import librariesBooksService from '../libraries-books/libraries-books.service.js'
import { queryPaginationValidator } from '../../middlewares/pagination-validator.middleware.js'
import { parseSkipLimitQP } from '../../utils.js'
import { ResultObject } from '../../results.js'
import { HttpStatusCode } from '../../types.js'

const librariesRouter = Router()

librariesRouter.post('/', bodyValidator(newLibrarySchema), checkJwt, tryCatch(async (req) => {
  const result = await librariesService.create(req.body, req.userId ?? '')
  return ResultObject.toFinal(HttpStatusCode.Created, result)
}))

librariesRouter.get('/:id', tryCatch(async (req) => {
  const result = await librariesService.get(req.params.id, req.userId ?? '', req.role ?? Role.Regular)
  return ResultObject.toFinal(HttpStatusCode.OK, result)
}))

librariesRouter.get('/', queryPaginationValidator, tryCatch(async (req) => {
  const result = await librariesService.list(req.userId ?? '', req.role ?? Role.Regular, parseSkipLimitQP(req))
  return ResultObject.toFinal(HttpStatusCode.OK, result)
}))

librariesRouter.delete('/:id', checkJwt, tryCatch(async (req) => {
  await librariesService.delete(req.params.id, req.userId ?? '', req.role ?? Role.Regular)
  return ResultObject.toFinal(HttpStatusCode.NoContent, null)
}))

librariesRouter.post('/:id/books', bodyValidator(bookdIdSchema), tryCatch(async (req) => {
  const result = await librariesService.addBook(req.params.id, req.body.id, req.userId ?? '')
  return ResultObject.toFinal(HttpStatusCode.Created, result)
}))

librariesRouter.delete('/:id/books', bodyValidator(bookdIdSchema), tryCatch(async (req) => {
  const result = await librariesService.removeBook(req.params.id, req.body.id, req.userId ?? '')
  return ResultObject.toFinal(HttpStatusCode.NoContent, result)
}))

// Libraries-books
librariesRouter.get('/:id/books', queryPaginationValidator, tryCatch(async (req) => {
  const result = await librariesBooksService.list(req.params.id, req.userId ?? '', parseSkipLimitQP(req))
  return ResultObject.toFinal(HttpStatusCode.OK, result)
}))

export default librariesRouter
