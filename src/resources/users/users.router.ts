import { Router } from 'express'
import usersService from './users.service.js'
import tryCatch from '../../try-catch.js'
import bodyValidator from '../../middlewares/body-validator.js'
import { createUserSchema } from './users.schemas.js'

const usersRouter = Router()

usersRouter.post('/', bodyValidator(createUserSchema), tryCatch(usersService.createUser))

export default usersRouter
