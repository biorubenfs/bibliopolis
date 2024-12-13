import { Router } from 'express'
import tryCatch from '../../try-catch.js'
import bodyValidator from '../../middlewares/body-validator.middleware.js'
import { newBookSchema } from './books.schema.js'
import booksService from './books.service.js'
import { queryPaginationValidator } from '../../middlewares/pagination-validator.middleware.js'
import { parseSkipLimitQP } from '../../utils.js'
import { HttpStatusCode } from '../../types.js'
import { ResultObject } from '../../results.js'

const booksRouter = Router()

booksRouter.post('/', bodyValidator(newBookSchema), tryCatch(async (req) => {
  const result = await booksService.create(req.body)

  return ResultObject.toFinal(HttpStatusCode.Created, result)
}))

booksRouter.get('/:id', tryCatch(async (req) => {
  const result = await booksService.getById(req.params.id)

  return ResultObject.toFinal(HttpStatusCode.OK, result)
}))

booksRouter.get('/', queryPaginationValidator, tryCatch(async (req) => {
  const results = await booksService.list(parseSkipLimitQP(req))

  return ResultObject.toFinal(HttpStatusCode.OK, results)
}))

export default booksRouter
