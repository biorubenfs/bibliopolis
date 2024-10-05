import { NextFunction, Request, Response } from 'express'

import { ZodSchema } from 'zod'
import { InvalidBodyError } from '../error/errors.js'


function bodyValidator (schema: ZodSchema): (req: Request, res: Response, next: NextFunction) => void {
  return function (req: Request, res: Response, next: NextFunction): void {
    const validationResult = schema.safeParse(req.body)

    if (!validationResult.success) {
      throw new InvalidBodyError('invalid body', validationResult.error.issues)
    }
    next()
  }
}

export default bodyValidator
