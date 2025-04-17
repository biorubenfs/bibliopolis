import { NextFunction, Request, Response } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import config from '../config.js'
import { Role } from '../resources/users/users.interfaces.js'
import { ExpiredTokenError, InvalidTokenError, TokenNotProvidedError } from '../error/errors.js'

// export function checkJwt (req: Request, res: Response, next: NextFunction): void {
//   const header = req.header('Authorization')
//   const token = header?.split(' ').at(1)

//   if (token == null) {
//     throw new TokenNotProvidedError('token not provided')
//   }

//   try {
//     const payload = jwt.verify(token, config.jwt.secret) as JWTPayload

//     req.userId = payload.id
//     req.role = payload.role

//     next()
//   } catch (error) {
//     throw new InvalidTokenError('invalid token')
//   }
// }

export function checkJwt (req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies.access_token

  if (token == null) {
    throw new TokenNotProvidedError('token not provided')
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret) as JwtPayload

    if (payload.id == null || payload.role == null || payload.exp == null) {
      throw new InvalidTokenError('invalid token')
    }

    req.userId = payload.id
    req.role = payload.role

    const now = new Date()

    if (payload.exp < now.getTime() / 1000) {
      throw new ExpiredTokenError('token expired')
    }

    next()
  } catch (error) {
    throw new InvalidTokenError('invalid token')
  }
}

export function checkAdmin (req: Request, res: Response, next: NextFunction): void {
  if (req.role !== Role.Admin) {
    throw new InvalidTokenError('must be admin')
  }
  next()
}
