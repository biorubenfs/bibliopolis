import ApiError from '../../error/api-error.js'
import { ApiRestErrorCode } from '../../error/types.js'

export class LibraryAlreadyExistsError extends ApiError {
  constructor (message: string) {
    super(ApiRestErrorCode.ConflictError, 409, message)
  }
}

export class LibraryNotFoundError extends ApiError {
  constructor (message: string) {
    super(ApiRestErrorCode.NotFoundError, 404, message)
  }
}

export class BookNotFoundInLibraryError extends ApiError {
  constructor (message: string) {
    super(ApiRestErrorCode.NotFoundError, 404, message)
  }
}

export class LibraryPermissionsError extends ApiError {
  constructor (message: string) {
    super(ApiRestErrorCode.PermissionError, 403, message)
  }
}
