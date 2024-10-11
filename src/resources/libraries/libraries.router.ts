import { Router } from 'express'
import tryCatch from '../../try-catch.js'
import bodyValidator from '../../middlewares/body-validator.middleware.js'
import { checkJwt } from '../../middlewares/jwt.middleware.js'

import { bookdIdSchema, newLibrarySchema } from './libraries.schemas.js'
import librariesService from './libraries.service.js'
import { Role } from '../users/users.interfaces.js'
import librariesBooksService from '../libraries-books/libraries-books.service.js'

const librariesRouter = Router()

librariesRouter.post('/', bodyValidator(newLibrarySchema), checkJwt, tryCatch(async (req) => await librariesService.create(req.body, req.userId ?? '')))
librariesRouter.get('/:id', tryCatch(async (req) => await librariesService.get(req.params.id, req.userId ?? '', req.role ?? Role.Regular)))
librariesRouter.get('/', tryCatch(async (req) => await librariesService.list(req.userId ?? '', req.role ?? Role.Regular)))

librariesRouter.post('/:id/books', bodyValidator(bookdIdSchema), tryCatch(async (req) => await librariesService.addBook(req.params.id, req.body.id, req.userId ?? '')))
librariesRouter.delete('/:id/books', bodyValidator(bookdIdSchema), tryCatch(async (req) => await librariesService.removeBook(req.params.id, req.body.id, req.userId ?? '')))

// Libraries-books
librariesRouter.get('/:id/books', tryCatch(async (req) => await librariesBooksService.list(req.params.id, req.userId ?? '')))

export default librariesRouter
