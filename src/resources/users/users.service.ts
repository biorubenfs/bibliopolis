import { Request, Response } from 'express'
import usersDao from './users.dao.js'
import { CollectionResultObject, SingleResultObject } from '../../results.js'
import { CreateUser, Role } from './users.interfaces.js'
import bcrypt from 'bcrypt'
import config from '../../config.js'

class UserService {
  async createUser (req: Request, res: Response): Promise<SingleResultObject> {
    const body: CreateUser = req.body

    const userData: CreateUser = {
      ...body,
      password: bcrypt.hashSync(body.password, config.hashRounds)
    }

    const newUser = await usersDao.createUser(userData, Role.Regular)

    return new SingleResultObject(newUser)
  }

  async listUsers (req: Request, res: Response): Promise<CollectionResultObject> {
    const users = await usersDao.listUsers()

    const mockPaginationObject = { page: { limit: 0, offset: 0 }, total: 0 }

    return new CollectionResultObject(users, mockPaginationObject)
  }
}

export default new UserService()
