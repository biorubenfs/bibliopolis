import { Router } from 'express'
import tryCatch from '../../try-catch.js'
import bodyValidator from '../../middlewares/body-validator.middleware.js'
import { newBookSchema } from './books.schema.js'
import booksService from './books.service.js'
import { queryPaginationValidator } from '../../middlewares/pagination-validator.middleware.js'
import { parseSkipLimitQP } from '../../utils.js'
import { HttpStatusCode } from '../../types.js'
import { checkJwt } from '../../middlewares/jwt.middleware.js'

const booksRouter = Router()

booksRouter.post('/', bodyValidator(newBookSchema), tryCatch(async (req) => {
  const result = await booksService.create(req.body)

  return { status: HttpStatusCode.Created, data: result }
}))

booksRouter.get('/:id', checkJwt, tryCatch(async (req) => {
  const result = await booksService.getById(req.params.id)

  return { status: HttpStatusCode.OK, data: result }
}))

booksRouter.get('/', queryPaginationValidator, tryCatch(async (req) => {
  const results = await booksService.list(parseSkipLimitQP(req))

  return { status: HttpStatusCode.OK, data: results }
}))

export default booksRouter
