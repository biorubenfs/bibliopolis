import { ulid } from 'ulid'
import Dao from '../../dao.js'
import { DBAdmin, NewAdminData } from './admins.interfaces.js'
import { AdminEntity } from './admins.entity.js'
import config from '../../config.js'
import bcrypt from 'bcrypt'

class UsersDao extends Dao<DBAdmin> {
  constructor () {
    super('admins')
  }

  async init(): Promise<void> {
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
    await this.createAdmin(defaultAdmin)
  }

  async createAdmin (newAdminData: NewAdminData): Promise<AdminEntity> {
    const adminData: DBAdmin = {
      ...newAdminData,
      _id: ulid()
    }
    await this.collection.insertOne(adminData)

    return new AdminEntity(adminData._id, adminData)
  }
}

export default new UsersDao()
