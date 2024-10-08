import { Router } from 'express'
import tryCatch from '../../try-catch.js'
import { checkJwt } from '../../middlewares/jwt.middleware.js'
import librariesBooksService from './libraries-books.service.js'

const librariesBooksRouter = Router()

librariesBooksRouter.get('/:id', checkJwt, tryCatch(async (req) => await librariesBooksService.list(req.params.id)))

export default librariesBooksRouter
