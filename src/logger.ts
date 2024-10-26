import { createLogger, format, transports } from 'winston'
import config from './config.js'

const logger = createLogger({
  level: config.environment === 'test' ? 'silent' : 'info',
  transports: [
    new transports.Console()
  ],
  format: format.combine(
    format.timestamp(),
    format.json()
  )
})

export default logger
