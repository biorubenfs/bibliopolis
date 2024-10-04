import { ulid } from 'ulid'
import Dao from '../../dao.js'
import { UserEntity } from './users.entity.js'
import { CreateUser, DBUser, Role } from './users.interfaces.js'
import config from '../../config.js'
import bcrypt from 'bcrypt'

class UsersDao extends Dao<DBUser> {
  constructor () {
    super('users')
  }

  async init (): Promise<void> {
    const now = new Date()
    const defaultAdmin = {
      name: config.defaultAdmin.name,
      email: config.defaultAdmin.email,
      password: bcrypt.hashSync(config.defaultAdmin.password, config.hashRounds),
      createdAt: now,
      updatedAt: now
    }
    const current = await this.collection.findOne({ name: defaultAdmin.name, email: defaultAdmin.email })
    if (current != null) {
      return
    }
    await this.createUser(defaultAdmin, Role.Admin)
  }

  async findUserByEmail (email: string): Promise<UserEntity | null> {
    const dbUser = await this.collection.findOne({ email })

    return dbUser != null ? new UserEntity(dbUser) : null
  }

  async createUser (newUserData: CreateUser, role: Role): Promise<UserEntity> {
    const now = new Date()
    const dbUser: DBUser = {
      ...newUserData,
      _id: ulid(),
      role,
      createdAt: now,
      updatedAt: now
    }
    await this.collection.insertOne(dbUser)

    return new UserEntity(dbUser)
  }

  async listUsers (): Promise<readonly UserEntity[]> {
    const dbUsers = await this.collection.find().toArray()

    return dbUsers.map(dbUser => new UserEntity(dbUser))
  }
}

export default new UsersDao()
