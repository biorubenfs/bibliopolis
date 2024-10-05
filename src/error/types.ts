export enum ApiRestErrorCode {
  InternalServerError = 'internal server error',
  InvalidTokenError = 'invalid token',
  InvalidUserOrPasswordError = 'invalid user or password',
  NotFoundError = 'not found',
  TokenNotProvidedError = 'token not provided',
  ValidationError = 'body validation error',
}
