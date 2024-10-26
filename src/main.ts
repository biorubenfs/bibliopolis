import App from './app.js'
import config from './config.js'
import logger from './logger.js'

async function main (): Promise<void> {
  const app = new App(config.port)

  try {
    await app.start()
  } catch (error) {
    logger.error('error at app starting', error)
    process.exit(1)
  }

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  process.on('SIGINT', async () => {
    logger.info('detected interruption')
    try {
      await app.stop()
      process.exit(0)
    } catch (stopError) {
      logger.error('error at app closing:', stopError)
      process.exit(1)
    }
  })
}

await main()
