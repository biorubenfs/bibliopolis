import { Router } from 'express'
import { queryPaginationValidator } from '../../middlewares/pagination-validator.middleware.js'
import { parseSkipLimitQP } from '../../utils.js'
import booksService from '../books/books.service.js'

const viewsRouter = Router()

viewsRouter.get('/home', queryPaginationValidator, async (req, res, next) => {
  const mainBookList = await booksService.list(parseSkipLimitQP(req))
  const books = mainBookList.entities
  res.render('books.list.ejs', { books })
})

export default viewsRouter
