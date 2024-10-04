import { ulid } from 'ulid'
import Dao from '../../dao.js'
import { UserEntity } from './users.entity.js'
import { CreateUser } from './users.interfaces.js'

export interface DBUser {
  _id: string
  name: string
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
}

class UsersDao extends Dao<DBUser> {
  constructor () {
    super('users')
  }

  async createUser (newUserData: CreateUser): Promise<UserEntity> {
    const now = new Date()
    const newUser: DBUser = {
      ...newUserData,
      _id: ulid(),
      createdAt: now,
      updatedAt: now
    }
    await this.collection.insertOne(newUser)

    return new UserEntity(newUser._id, newUser)
  }

  async listUsers(): Promise<ReadonlyArray<UserEntity>> {
    const users = await this.collection.find().toArray()

    return users.map(user => new UserEntity(user._id, user))
  }
}

export default new UsersDao()
