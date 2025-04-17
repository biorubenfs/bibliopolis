import { ZodIssue } from 'zod'
import ApiError from './api-error.js'
import { ApiRestErrorCode } from './types.js'

export class InvalidBodyError extends ApiError {
  constructor (message: string, issues: ZodIssue[]) {
    super(ApiRestErrorCode.ValidationError, 400, message, issues)
  }
}

export class TokenNotProvidedError extends ApiError {
  constructor (message: string) {
    super(ApiRestErrorCode.TokenNotProvidedError, 401, message)
  }
}

export class InvalidTokenError extends ApiError {
  constructor (message: string) {
    super(ApiRestErrorCode.InvalidTokenError, 403, message)
  }
}

export class ExpiredTokenError extends ApiError {
  constructor (message: string) {
    super(ApiRestErrorCode.InvalidTokenError, 403, message)
  }
}
