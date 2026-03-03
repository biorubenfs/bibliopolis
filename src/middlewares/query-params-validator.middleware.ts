import { NextFunction, Request, Response } from 'express'
import { InvalidBodyError } from '../error/errors.js'

export function queryParamsValidator (schema: Zod.Schema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const validationResult = schema.safeParse(req.query)
    if (!validationResult.success) {
      throw new InvalidBodyError('invalid query params', validationResult.error.issues)
    }
    next()
  }
}
