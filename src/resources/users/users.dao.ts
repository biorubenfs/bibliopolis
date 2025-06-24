import { ulid } from 'ulid'
import Dao from '../../dao.js'
import { UserEntity } from './users.entity.js'
import { CreateUser, DBUser, Role, UpdateUser } from './users.interfaces.js'
import config from '../../config.js'
import bcrypt from 'bcryptjs'
import { isNotNull } from '../../utils.js'

function dbUserToEntity (dbUser: DBUser | null): UserEntity | null {
  return dbUser == null ? null : new UserEntity(dbUser)
}

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
    await this.create(defaultAdmin, Role.Admin)
  }

  async findById (id: string): Promise<UserEntity | null> {
    const dbUser = await this.collection.findOne({ _id: id })

    return dbUserToEntity(dbUser)
  }

  async findByEmail (email: string): Promise<UserEntity | null> {
    const dbUser = await this.collection.findOne({ email })

    return dbUserToEntity(dbUser)
  }

  async create (newUserData: CreateUser, role: Role): Promise<UserEntity> {
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

  async list (skip: number, limit: number): Promise<readonly UserEntity[]> {
    const dbUsers = await this.collection.find().skip(skip).limit(limit).toArray()

    return dbUsers.map(dbUserToEntity).filter(isNotNull)
  }

  async count (): Promise<number> {
    const total = await this.collection.countDocuments()
    return total
  }

  async updatePassword (userId: string, newPassword: string): Promise<UserEntity | null> {
    const user = await this.collection.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          password: newPassword
        },
        $currentDate: { updatedAt: true }
      },
      { returnDocument: 'after' }
    )

    return dbUserToEntity(user)
  }

  async updateUser (userId: string, data: UpdateUser): Promise<UserEntity | null> {
    const user = await this.collection.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          ...data
        },
        $currentDate: { updatedAt: true }
      },
      { returnDocument: 'after' }
    )

    return dbUserToEntity(user)
  }
}

export default new UsersDao()
