import { Role } from './resources/users/users.interfaces'

declare global {
  namespace Express {
    interface Request {
      userId?: string
      role?: Role
    }
  }
}
