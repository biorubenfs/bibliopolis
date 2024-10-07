import ApiError from '../../error/api-error.js'
import { ApiRestErrorCode } from '../../error/types.js'

export class LibraryAlreadyExists extends ApiError {
  constructor (message: string) {
    super(ApiRestErrorCode.ConflictError, 409, message)
  }
}

export class LibraryNotFound extends ApiError {
  constructor (message: string) {
    super(ApiRestErrorCode.NotFoundError, 404, message)
  }
}

export class LibraryPermissionsError extends ApiError {
  constructor (message: string) {
    super(ApiRestErrorCode.PermissionError, 404, message)
  }
}
