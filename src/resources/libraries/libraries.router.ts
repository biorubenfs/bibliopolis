import { Router } from 'express'
import tryCatch from '../../try-catch.js'
import bodyValidator from '../../middlewares/body-validator.middleware.js'
import { checkJwt } from '../../middlewares/jwt.middleware.js'

import { newLibrarySchema } from './libraries.schemas.js'
import librariesService from './libraries.service.js'
import { Role } from '../users/users.interfaces.js'

const librariesRouter = Router()

librariesRouter.post('/', bodyValidator(newLibrarySchema), checkJwt, tryCatch(async (req) => await librariesService.create(req.body, req.userId ?? '')))
librariesRouter.get('/:id', checkJwt, tryCatch(async (req) => await librariesService.get(req.params.id, req.userId ?? '', req.role ?? Role.Regular)))
librariesRouter.get('/', checkJwt, tryCatch(async (req) => await librariesService.list(req.userId ?? '', req.role ?? Role.Regular)))
// librariesRouter.get('/:id/books')

export default librariesRouter
