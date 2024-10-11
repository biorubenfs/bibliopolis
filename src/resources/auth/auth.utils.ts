import jwt from 'jsonwebtoken'
import config from '../../config.js'
import { Role } from '../users/users.interfaces.js'

export function makeJwt (userId: string, role: Role): string {
  const token = jwt.sign({
    id: userId,
    role
  }, config.jwt.secret, { expiresIn: '1d' })

  return token
}
