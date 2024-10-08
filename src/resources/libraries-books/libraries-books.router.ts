import { Router } from 'express'
import tryCatch from '../../try-catch.js'
import bodyValidator from '../../middlewares/body-validator.middleware.js'
import { checkJwt } from '../../middlewares/jwt.middleware.js'
import { Role } from '../users/users.interfaces.js'
import librariesBooksService from './libraries-books.service.js'

const librariesBooksRouter = Router()

librariesBooksRouter.get('/:id', checkJwt, tryCatch(async (req) => librariesBooksService.list(req.params.id)))

export default librariesBooksRouter
