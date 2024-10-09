import { z } from 'zod'
import { InvalidBodyError } from '../error/errors.js'
import { NextFunction, Request, Response } from 'express'

const DEFAULT_SKIP_STRING_VALUE = '0'
const DEFAULT_LIMIT_STRING_VALUE = '10'

export function queryPaginationValidator (req: Request, res: Response, next: NextFunction): void {
  const paginationSchema: Zod.Schema = z.object({
    skip: z.string().optional()
      .transform((val) => parseInt(val ?? DEFAULT_SKIP_STRING_VALUE, 0))
      .refine(val => !isNaN(val) && val >= 0, 'skip must be a number greater than o equal >= 0'),
    limit: z.string().optional()
      .transform((val) => parseInt(val ?? DEFAULT_LIMIT_STRING_VALUE, 10))
      .refine(val => !isNaN(val) && val > 0 && val <= 100, 'limit must be a number > 0 and <= 100')
  })

  const paginationQueryValidationResult = paginationSchema.safeParse(req.query)
  if (!paginationQueryValidationResult.success) {
    throw new InvalidBodyError('invalid query params', paginationQueryValidationResult.error.issues)
  }

  req.query.skip = req.query.skip ?? DEFAULT_SKIP_STRING_VALUE
  req.query.limit = req.query.limit ?? DEFAULT_LIMIT_STRING_VALUE

  next()
}
