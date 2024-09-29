import Dao from '../../dao.js'

interface DBUser {
  _id: string
  content: string
}

class UsersDao extends Dao<DBUser> {
  constructor () {
    super('users')
  }

  async createUser (): Promise<void> {
    await this.collection.insertOne({ _id: '1', content: 'content' })
  }
}

export default new UsersDao()
