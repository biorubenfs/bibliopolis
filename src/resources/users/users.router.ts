import { Router } from 'express'
import usersService from './users.service.js'
import tryCatch from '../../try-catch.js'
import bodyValidator from '../../middlewares/body-validator.middleware.js'
import { createUserSchema } from './users.schemas.js'

const usersRouter = Router()

usersRouter.post('/', bodyValidator(createUserSchema), tryCatch(async (req) => await usersService.createUser(req.body)))
usersRouter.get('/', tryCatch(usersService.listUsers))

export default usersRouter
