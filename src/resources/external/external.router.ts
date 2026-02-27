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
import booksService from '../books/books.service.js'

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

  // TODO: Do this in a service
  let result: MiscResultObject

  // First check if the book exists in the local collection, if it does return it, otherwise fetch it from the open library API
  const bookInCollection = await booksService.fetchByIsbn(isbn as string)

  if (bookInCollection != null) {
    result = new MiscResultObject('book-result', {
      title: bookInCollection?.title ?? null,
      isbn13: bookInCollection?.isbn13 ?? null,
      isbn10: bookInCollection?.isbn10 ?? null,
      authors: bookInCollection?.authors ?? null,
      coverUrl: bookInCollection?.cover != null ? getCoverUrl(bookInCollection.cover, CoverSize.L) : null
    })
  } else {
    const results = await openlibraryApi.fetchBookByIsbn(isbn as string)
    const { cover, ...book } = await buildBook(results)

    result = new MiscResultObject('book-result', {
      ...book,
      coverUrl: getCoverUrl(results.covers?.at(0) ?? null, CoverSize.L)
    })
  }

  return { status: HttpStatusCode.OK, data: result }
})
)

export default externalRouter
