import { SetCookieResultObject } from '../../results.js'
import bcrypt from 'bcryptjs'
import { Login } from './auth.interfaces.js'
import usersDao from '../users/users.dao.js'
import { InvalidLoginError } from './auth.error.js'
import { makeJwt } from './auth.utils.js'
import { UserEntity } from '../users/users.entity.js'
import config from '../../config.js'
import { CookieOptions } from 'express'

class AuthService {
  // constructor() {
  //   // bind `login` to instance context
  //   this.login = this.login.bind(this);
  // }
  // async login (body: Login): Promise<MiscResultObject> {
  //   const user = await usersDao.findByEmail(body.email)
  //   const isPasswordValid = bcrypt.compareSync(body.password, user?.password ?? '')

  //   if (user == null || !isPasswordValid) {
  //     throw new InvalidLoginError('invalid email or password')
  //   }

  //   const token = makeJwt(user.id, user.role)

  //   return new MiscResultObject({ token })
  // }

  async login (body: Login): Promise<SetCookieResultObject<UserEntity>> {
    const user = await usersDao.findByEmail(body.email)
    const isPasswordValid = bcrypt.compareSync(body.password, user?.password ?? '')

    if (user == null || !isPasswordValid) {
      throw new InvalidLoginError('invalid email or password')
    }

    const token = makeJwt(user.id, user.role)
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const cookieOptions = { ...config.cookieOptions } as CookieOptions
    return new SetCookieResultObject('access_token', token, cookieOptions, user)
  }
}

export default new AuthService()
