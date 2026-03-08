import { Router } from 'express'
import tryCatch from '../../try-catch.js'
import { queryPaginationValidator } from '../../middlewares/pagination-validator.middleware.js'
import { CoverSize, getBookFromSources, getCoverUrl } from '../../utils.js'
import { HttpStatusCode } from '../../types.js'
import { MiscResultObject } from '../../results.js'
import { InvalidBodyError } from '../../error/errors.js'
import { z } from 'zod'
import booksService from '../books/books.service.js'
import { buildBookToBibliopolis } from '../sources/sources.utils.js'
import { ISBNUtils } from '../../utils/isbn.utils.js'

const externalRouter = Router()

externalRouter.get('/', queryPaginationValidator, tryCatch(async (req) => {
  const schema = z.object({
    isbn: z.string()
      .transform((value) => value.trim().replace(/[-\s]/g, ''))
      .refine((value) => {
      // check if the value is a valid isbn-10 or isbn-13 using isbn-utils
        if (ISBNUtils.isValidIsbn10(value) || ISBNUtils.isValidIsbn13(value)) {
          return true
        }
        return false
      }, { message: 'Invalid ISBN-10 or ISBN-13' })
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
      coverUrl: bookInCollection?.cover != null ? getCoverUrl(bookInCollection.cover.source, bookInCollection.cover.value, CoverSize.L) : null
    })
  } else {
    const { source, fetchedBook } = await getBookFromSources(isbn as string)

    const { cover, ...book } = await buildBookToBibliopolis(source, fetchedBook)

    result = new MiscResultObject('book-result', {
      ...book,
      coverUrl: getCoverUrl(cover?.source, cover?.value, CoverSize.L)
    })
  }

  return { status: HttpStatusCode.OK, data: result }
})
)

export default externalRouter
