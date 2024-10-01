import mongo from './mongo.js'
import adminsDao from './resources/admins/admins.dao.js'
import Server from './server.js'

export default class App {
  server?: Server

  async start (): Promise<void> {
    await mongo.start()

    this.server = new Server(3000)
    this.server.listen()
    await adminsDao.init()
  }

  async stop (): Promise<void> {
    await mongo.stop()
    this.server?.stop()
  }
}
