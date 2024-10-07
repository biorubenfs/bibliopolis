import { Router } from 'express'
import tryCatch from '../../try-catch.js'
import bodyValidator from '../../middlewares/body-validator.middleware.js'
import { newBookSchema } from './books.schema.js'
import booksService from './books.service.js'

const booksRouter = Router()

booksRouter.post('/', bodyValidator(newBookSchema), tryCatch(async (req) => await booksService.create(req.body)))
booksRouter.get('/:id', tryCatch(async (req) => await booksService.getById(req.params.id)))
booksRouter.get('/', tryCatch(booksService.list))

export default booksRouter