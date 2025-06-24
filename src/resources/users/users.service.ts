import usersDao from './users.dao.js'
import { CollectionResultObject, SingleResultObject } from '../../results.js'
import { CreateUser, Role } from './users.interfaces.js'
import bcrypt from 'bcryptjs'
import config from '../../config.js'
import { UserEmailAlreadyExists, UserNotFoundError } from './users.error.js'
import { UserEntity } from './users.entity.js'
import { Page } from '../../types.js'
import crypto from 'crypto'

const VALIDATION_CODE_LIMIT = 9999

class UsersService {
  async signup (body: CreateUser): Promise<UserEntity> {
    const existingUser = await usersDao.findByEmail(body.email)
    if (existingUser != null) {
      throw new UserEmailAlreadyExists(`there is already a user registered with email ${body.email}`)
    }

    const validationCode = crypto.randomInt(VALIDATION_CODE_LIMIT).toString()
    const userData: CreateUser = {
      ...body,
      validationCode,
      password: bcrypt.hashSync(body.password, config.hashRounds)
    }

    const newUser = await usersDao.create(userData, Role.Regular)

    return newUser
  }

  async getById (id: string): Promise<SingleResultObject<UserEntity>> {
    const user = await usersDao.findById(id)
    if (user == null) {
      throw new UserNotFoundError('user not found')
    }

    return new SingleResultObject(user)
  }

  async getByEmail (email: string): Promise<UserEntity> {
    const user = await usersDao.findByEmail(email)

    if (user == null) {
      throw new UserNotFoundError('user not found')
    }

    return user
  }

  async list (page: Page): Promise<CollectionResultObject<UserEntity>> {
    const [users, total] = await Promise.all([
      await usersDao.list(page.skip, page.limit),
      await usersDao.count()
    ])

    return new CollectionResultObject(users, { ...page, total })
  }

  async validate (id: string, validationCode: string): Promise<void> {
    await usersDao.validate(id, validationCode)
  }
}

export default new UsersService()
