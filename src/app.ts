import logger from './logger.js'
import mongo from './mongo.js'
import usersDao from './resources/users/users.dao.js'
import Server from './server.js'

export default class App {
  server?: Server
  port: number

  constructor (port: number) {
    this.port = port
  }

  async start (): Promise<void> {
    logger.info('starting app...')
    await mongo.start()

    this.server = new Server(this.port)
    this.server.listen()

    logger.info('app started succesfully')
    logger.info('press CTRL+C to stop app')

    await usersDao.init()
  }

  async stop (): Promise<void> {
    logger.info('stopping app...')
    await mongo.stop()
    this.server?.stop()
    logger.info('app stopped succesfully')
  }
}
