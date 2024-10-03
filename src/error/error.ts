import { ZodIssue } from 'zod'
import { ApiErrors } from './types'

export default class ApiError extends Error {
  errorCode: ApiErrors
  statusCode: number
  validationError?: ZodIssue[] | undefined

  constructor (errorCode: ApiErrors, statusCode: number, message: string, validationError?: ZodIssue[] | undefined) {
    super(message)
    this.errorCode = errorCode
    this.statusCode = statusCode
    this.validationError = validationError
  }
}
