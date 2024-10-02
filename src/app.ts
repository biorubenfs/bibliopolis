import mongo from './mongo.js'
import adminsDao from './resources/admins/admins.dao.js'
import Server from './server.js'

export default class App {
  server?: Server
  port: number

  constructor (port: number) {
    this.port = port
  }

  async start (): Promise<void> {
    await mongo.start()

    this.server = new Server(this.port)
    this.server.listen()
    await adminsDao.init()
  }

  async stop (): Promise<void> {
    await mongo.stop()
    this.server?.stop()
  }
}
