import jwt from 'jsonwebtoken'
import { EntityType } from '../../entity.js'
import config from '../../config.js'
import { Role } from '../users/users.interfaces.js'

export function makeJwt (userId: string, role: Role): string {
  const token = jwt.sign({
    type: EntityType.Users,
    id: userId,
    role
  }, config.jwt.secret, { expiresIn: '1d' })

  return token
}
