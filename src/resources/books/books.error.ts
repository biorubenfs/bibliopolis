import ApiError from '../../error/api-error.js'
import { ApiRestErrorCode } from '../../error/types.js'

export class BookAlreadyExists extends ApiError {
  constructor (message: string) {
    super(ApiRestErrorCode.BookConflictError, 409, message)
  }
}

export class BookNotFound extends ApiError {
  constructor (message: string) {
    super(ApiRestErrorCode.NotFoundError, 404, message)
  }
}
