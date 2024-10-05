import ApiError from '../../error/api-error.js'
import { ApiRestErrorCode } from '../../error/types.js'

export class InvalidLoginError extends ApiError {
  constructor (message: string) {
    super(ApiRestErrorCode.InvalidUserOrPasswordError, 403, message)
  }
}
