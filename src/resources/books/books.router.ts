import { Router } from 'express'
import tryCatch from '../../try-catch.js'
import bodyValidator from '../../middlewares/body-validator.middleware.js'
import { newBookSchema } from './books.schema.js'
import booksService from './books.service.js'
import { queryPaginationValidator } from '../../middlewares/pagination-validator.middleware.js'
import { parseSkipLimitQP } from '../../utils.js'

const booksRouter = Router()

booksRouter.post('/', bodyValidator(newBookSchema), tryCatch(async (req) => await booksService.create(req.body)))
booksRouter.get('/:id', tryCatch(async (req) => await booksService.getById(req.params.id)))
booksRouter.get('/', queryPaginationValidator, tryCatch(async (req) => await booksService.list(...parseSkipLimitQP(req))))

export default booksRouter
