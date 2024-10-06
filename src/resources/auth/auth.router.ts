import { Router } from 'express'
import tryCatch from '../../try-catch.js'
import bodyValidator from '../../middlewares/body-validator.middleware.js'
import { loginSchema } from './auth.schemas.js'
import authService from './auth.service.js'

const authRouter = Router()

authRouter.post('/', bodyValidator(loginSchema), tryCatch(async (req, res) => await authService.login(req.body)))

export default authRouter
