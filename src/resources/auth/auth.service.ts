import { SetCookieResultObject } from '../../results.js'
import bcrypt from 'bcryptjs'
import { Login } from './auth.interfaces.js'
import { InvalidLoginError } from './auth.error.js'
import { makeJwt } from './auth.utils.js'
import { UserEntity } from '../users/users.entity.js'
import config from '../../config.js'
import { CookieOptions } from 'express'
import { CreateUser } from '../users/users.interfaces.js'
import usersService from '../users/users.service.js'

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

  async signup (body: CreateUser): Promise<SetCookieResultObject<UserEntity>> {
    const newUser = await usersService.signup(body)
    const token = makeJwt(newUser.id, newUser.role)

    return new SetCookieResultObject('access_token', token, {}, newUser)
  }

  async login (body: Login): Promise<SetCookieResultObject<UserEntity>> {
    let user
    try {
      user = await usersService.getByEmail(body.email)
    } catch (error) {
      if (typeof error === 'object' && error != null && 'statusCode' in error && error.statusCode === 404) {
        // do nothing
      } else {
        throw error
      }
    }

    const isPasswordValid = (user != null) ? bcrypt.compareSync(body.password, user.password) : false

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
