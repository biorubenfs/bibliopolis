import mongo from './mongo.js'
import Server from './server.js'

export default class App {
  server?: Server

  async start (): Promise<void> {
    await mongo.start()

    this.server = new Server(3000)
    this.server.listen()
  }

  async stop (): Promise<void> {
    await mongo.stop()
    this.server?.stop()
  }
}
