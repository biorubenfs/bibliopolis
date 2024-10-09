import { Router } from 'express'
import tryCatch from '../../try-catch.js'
import bodyValidator from '../../middlewares/body-validator.middleware.js'
import { newBookSchema } from './books.schema.js'
import booksService from './books.service.js'
import { queryPaginationValidator } from '../../middlewares/pagination-validator.middleware.js'

const booksRouter = Router()

booksRouter.post('/', bodyValidator(newBookSchema), tryCatch(async (req) => await booksService.create(req.body)))
booksRouter.get('/:id', tryCatch(async (req) => await booksService.getById(req.params.id)))
booksRouter.get('/', queryPaginationValidator, tryCatch(async (req) => {
  const { skip, limit } = req.query
  if (typeof skip !== 'string' || typeof limit !== 'string') {
    throw new Error()
  }
  // At this point we know that skip and limit are strings parseable to number without errors (see paginationSchema validation middleware)
  return await booksService.list(parseInt(skip), parseInt(limit))
}))

export default booksRouter
