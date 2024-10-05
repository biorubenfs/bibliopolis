import { NextFunction, Request, Response } from 'express'
import ApiError from './api-error.js'
import { ApiRestErrorCode } from './types.js'

function errorHandler (error: Error, req: Request, res: Response, next: NextFunction): void {
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      statusCode: error.statusCode,
      errorCode: error.errorCode,
      message: error.message,
      validationError: error.validationError
    })

    return
  }

  res.status(500).json({
    statusCode: '500',
    errorCode: ApiRestErrorCode.InternalServerError,
    message: 'Something went really wrong',
    error: error.message
  })
}

export default errorHandler
