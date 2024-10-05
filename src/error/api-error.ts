import { ZodIssue } from 'zod'
import { ApiRestErrorCode } from './types'

export default abstract class ApiError extends Error {
  errorCode: ApiRestErrorCode
  statusCode: number
  validationError?: ZodIssue[] | undefined

  constructor (errorCode: ApiRestErrorCode, statusCode: number, message: string, validationError?: ZodIssue[] | undefined) {
    super(message)
    this.errorCode = errorCode
    this.statusCode = statusCode
    this.validationError = validationError
  }
}
