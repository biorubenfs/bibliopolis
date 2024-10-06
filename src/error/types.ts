export enum ApiRestErrorCode {
  InternalServerError = 'internal server error',
  InvalidTokenError = 'invalid token',
  InvalidCredentials = 'invalid email or password',
  NotFoundError = 'not found',
  TokenNotProvidedError = 'token not provided',
  ValidationError = 'body validation error',
}
