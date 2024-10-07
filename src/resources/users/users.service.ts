import usersDao from './users.dao.js'
import { CollectionResultObject, SingleResultObject } from '../../results.js'
import { CreateUser, Role } from './users.interfaces.js'
import bcrypt from 'bcrypt'
import config from '../../config.js'
import { UserNotFoundError } from './users.error.js'

class UsersService {
  async create (body: CreateUser): Promise<SingleResultObject> {
    const userData: CreateUser = {
      ...body,
      password: bcrypt.hashSync(body.password, config.hashRounds)
    }

    const newUser = await usersDao.create(userData, Role.Regular)

    return new SingleResultObject(newUser)
  }

  async getByEmail (email: string): Promise<SingleResultObject> {
    const user = await usersDao.findByEmail(email)

    if (user == null) {
      throw new UserNotFoundError('user not found')
    }

    return new SingleResultObject(user)
  }

  async list (): Promise<CollectionResultObject> {
    const users = await usersDao.list()

    const mockPaginationObject = { page: { limit: 0, offset: 0 }, total: 0 }

    return new CollectionResultObject(users, mockPaginationObject)
  }
}

export default new UsersService()
