import { Router } from 'express'
import usersService from './users.service.js'
import tryCatch from '../../try-catch.js'
import bodyValidator from '../../middlewares/body-validator.middleware.js'
import { createUserSchema } from './users.schemas.js'
import { checkAdmin, checkJwt } from '../../middlewares/jwt.middleware.js'
import { queryPaginationValidator } from '../../middlewares/pagination-validator.middleware.js'
import { parseSkipLimitQP } from '../../utils.js'

const usersRouter = Router()

usersRouter.post('/', bodyValidator(createUserSchema), tryCatch(async (req) => await usersService.create(req.body)))
usersRouter.get('/me', checkJwt, tryCatch(async (req) => await usersService.getById(req.userId ?? '')))
usersRouter.get('/', checkJwt, checkAdmin, queryPaginationValidator, tryCatch(async (req) => await usersService.list(...parseSkipLimitQP(req))))

export default usersRouter
