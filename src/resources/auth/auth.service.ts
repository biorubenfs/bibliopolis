import { Request, Response } from 'express'
import { MiscResultObject } from '../../results.js'
import bcrypt from 'bcrypt'
import config from '../../config.js'
import { LoginSchema } from './auth.interfaces.js'
import ApiError from '../../error/error.js'
import { ApiErrors } from '../../error/types.js'
import usersDao from '../users/users.dao.js'
import jwt from 'jsonwebtoken'
import { EntityType } from '../../entity.js'

class AuthService {
  // constructor() {
  //   // bind `login` to instance context
  //   this.login = this.login.bind(this);
  // }
  private readonly makeToken = (id: string): string => {
    const token = jwt.sign(
      {
        type: EntityType.Users,
        id
      },
      config.jwt.secret,
      {
        expiresIn: '1h'
      }
    )
    return token
  }

  async login (req: Request, res: Response): Promise<MiscResultObject> {
    const body: LoginSchema = req.body

    const user = await usersDao.findUserByEmail(body.email)
    const isPasswordValid = bcrypt.compareSync(body.password, user?.password ?? '')

    if (user == null || !isPasswordValid) {
      throw new ApiError(ApiErrors.InvalidUserOrPasswordError, 403, 'email or password are invalid')
    }

    const token = this.makeToken(user.id)

    return new MiscResultObject({ token })
  }
}

export default new AuthService()
