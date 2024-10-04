import { NextFunction, Request, Response } from 'express'

import { ZodSchema } from 'zod'
import ApiError from '../error/error.js'
import { ApiErrors } from '../error/types.js'

function bodyValidator (schema: ZodSchema): (req: Request, res: Response, next: NextFunction) => void {
  return function (req: Request, res: Response, next: NextFunction): void {
    const validationResult = schema.safeParse(req.body)

    if (!validationResult.success) {
      throw new ApiError(ApiErrors.ValidationError, 400, 'body validation error', validationResult.error.errors)
    }
    next()
  }
}

export default bodyValidator
