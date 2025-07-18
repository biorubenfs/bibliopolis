import { Router } from 'express'
import userBooksService from './user-books.service.js'
import bodyValidator from '../../middlewares/body-validator.middleware.js'
import tryCatch from '../../try-catch.js'
import { HttpStatusCode } from '../../types.js'
import { userBookUpdateSchema } from './user-books.schemas.js'

const userBooksRouter = Router()

userBooksRouter.get('/:bookId', tryCatch(async (req) => {
  const result = await userBooksService.get(req.params.bookId, req.userId ?? '')
  return { status: HttpStatusCode.OK, data: result }
}))

userBooksRouter.patch('/:bookId', bodyValidator(userBookUpdateSchema), tryCatch(async (req) => {
  const result = await userBooksService.update(req.params.bookId, req.userId ?? '', req.body)
  return { status: HttpStatusCode.OK, data: result }
}))

export default userBooksRouter
