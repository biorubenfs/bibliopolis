import usersDao from './users.dao.js'
import { CollectionResultObject, SingleResultObject } from '../../results.js'
import { CreateUser, Role, UpdateUser } from './users.interfaces.js'
import bcrypt from 'bcryptjs'
import config from '../../config.js'
import { InvalidCurrentPassword, UserEmailAlreadyExists, UserNotFoundError } from './users.error.js'
import { UserEntity } from './users.entity.js'
import { Page } from '../../types.js'

export function hashPasswordSync (password: string): string {
  return bcrypt.hashSync(password, config.hashRounds)
}

class UsersService {
  async signup (body: CreateUser): Promise<SingleResultObject<UserEntity>> {
    const existingUser = await usersDao.findByEmail(body.email)
    if (existingUser != null) {
      throw new UserEmailAlreadyExists(`there is already a user registered with email ${body.email}`)
    }
    const userData: CreateUser = {
      ...body,
      password: hashPasswordSync(body.password)
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

  async list (page: Page): Promise<CollectionResultObject<UserEntity>> {
    const [users, total] = await Promise.all([
      await usersDao.list(page.skip, page.limit),
      await usersDao.count()
    ])

    return new CollectionResultObject(users, { ...page, total })
  }

  async updatePassword (userId: string, currentPassword: string, newPassword: string): Promise<SingleResultObject<UserEntity>> {
    const user = await this.getById(userId)

    const isPasswordValid = bcrypt.compareSync(currentPassword, user.entity.password)

    if (!isPasswordValid) {
      throw new InvalidCurrentPassword('invalid current password')
    }

    const hashedPassword = hashPasswordSync(newPassword)
    const updUser = await usersDao.updatePassword(userId, hashedPassword)
    if (updUser == null) {
      throw new UserNotFoundError('user not found')
    }

    return new SingleResultObject(updUser)
  }

  async updateUser (userId: string, data: UpdateUser): Promise<SingleResultObject<UserEntity>> {
    const updUser = await usersDao.updateUser(userId, data)
    if (updUser == null) {
      throw new UserNotFoundError('user not found')
    }

    return new SingleResultObject(updUser)
  }
}

export default new UsersService()
