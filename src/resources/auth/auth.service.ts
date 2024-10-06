import { MiscResultObject } from '../../results.js'
import bcrypt from 'bcrypt'
import config from '../../config.js'
import { Login } from './auth.interfaces.js'
import usersDao from '../users/users.dao.js'
import jwt from 'jsonwebtoken'
import { EntityType } from '../../entity.js'
import { Role } from '../users/users.interfaces.js'
import { InvalidLoginError } from './auth.error.js'

class AuthService {
  // constructor() {
  //   // bind `login` to instance context
  //   this.login = this.login.bind(this);
  // }
  private readonly makeToken = (id: string, role: Role): string => {
    const token = jwt.sign({
      type: EntityType.Users,
      id,
      role
    }, config.jwt.secret, { expiresIn: '1h' }
    )
    return token
  }

  async login (body: Login): Promise<MiscResultObject> {
    const user = await usersDao.findUserByEmail(body.email)
    const isPasswordValid = bcrypt.compareSync(body.password, user?.password ?? '')

    if (user == null || !isPasswordValid) {
      throw new InvalidLoginError('invalid email or password')
    }

    const token = this.makeToken(user.id, user.role)

    return new MiscResultObject({ token })
  }
}

export default new AuthService()
