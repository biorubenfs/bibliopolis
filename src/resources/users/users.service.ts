import usersDao from './users.dao.js'
import { CollectionResultObject, SingleResultObject } from '../../results.js'
import { CreateUser, Role } from './users.interfaces.js'
import bcrypt from 'bcrypt'
import config from '../../config.js'
import { UserEmailAlreadyExists, UserNotFoundError } from './users.error.js'
import { UserEntity } from './users.entity.js'

class UsersService {
  async create (body: CreateUser): Promise<SingleResultObject<UserEntity>> {
    const existingUser = await usersDao.findByEmail(body.email)
    if (existingUser != null) {
      throw new UserEmailAlreadyExists(`there is already a user registered with email ${body.email}`)
    }
    const userData: CreateUser = {
      ...body,
      password: bcrypt.hashSync(body.password, config.hashRounds)
    }

    const newUser = await usersDao.create(userData, Role.Regular)

    return new SingleResultObject(newUser)
  }

  async getById (id: string): Promise<SingleResultObject<UserEntity>> {
    const user = await usersDao.findById(id)
    if (user == null) {
      throw new UserNotFoundError('user not found')
    }

    return new SingleResultObject(user)
  }

  async getByEmail (email: string): Promise<SingleResultObject<UserEntity>> {
    const user = await usersDao.findByEmail(email)

    if (user == null) {
      throw new UserNotFoundError('user not found')
    }

    return new SingleResultObject(user)
  }

  async list (skip: number, limit: number): Promise<CollectionResultObject<UserEntity>> {
    const [users, total] = await Promise.all([
      await usersDao.list(skip, limit),
      await usersDao.count()
    ])

    return new CollectionResultObject(users, { page: { limit, skip }, total })
  }
}

export default new UsersService()
