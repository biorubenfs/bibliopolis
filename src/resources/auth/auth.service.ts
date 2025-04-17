import { SetCookieResultObject } from '../../results.js'
import bcrypt from 'bcryptjs'
import { Login } from './auth.interfaces.js'
import { InvalidLoginError } from './auth.error.js'
import { makeJwt } from './auth.utils.js'
import { UserEntity } from '../users/users.entity.js'
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
    const user = await usersService.getByEmail(body.email)
    const isPasswordValid = bcrypt.compareSync(body.password, user.password ?? '')

    if (user == null || !isPasswordValid) {
      throw new InvalidLoginError('invalid email or password')
    }

    const token = makeJwt(user.id, user.role)
    return new SetCookieResultObject('access_token', token, {}, user)
  }
}

export default new AuthService()
