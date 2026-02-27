import { Router } from 'express'
import tryCatch from '../../try-catch.js'

import { queryPaginationValidator } from '../../middlewares/pagination-validator.middleware.js'
import { CoverSize, getCoverUrl } from '../../utils.js'
import { HttpStatusCode } from '../../types.js'
import openlibraryApi from '../libraries/open-library/api.js'
import { buildBook } from '../libraries/open-library/utils.js'
import { MiscResultObject } from '../../results.js'
import { InvalidBodyError } from '../../error/errors.js'
import { z } from 'zod'

const externalRouter = Router()

externalRouter.get('/', queryPaginationValidator, tryCatch(async (req) => {
  const schema = z.object({
    isbn: z.string()
  })

  const validationResult = schema.safeParse(req.query)

  const { isbn } = req.query

  // TODO: Do this in a middleware and throw a 400 error with query validation error instead body validation error
  if (!validationResult.success) {
    throw new InvalidBodyError('invalid query param', validationResult.error.issues)
  }

  const results = await openlibraryApi.fetchBookByIsbn(isbn as string)
  const { cover, ...book } = await buildBook(results)

  const resultBook = new MiscResultObject('external-book', {
    ...book,
    coverUrl: getCoverUrl(results.covers?.at(0) ?? null, CoverSize.L)
  })

  return { status: HttpStatusCode.OK, data: resultBook }
})
)

export default externalRouter
