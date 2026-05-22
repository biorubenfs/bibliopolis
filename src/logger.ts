import { createLogger, format, transports } from 'winston'
import config from './config.js'

const logger = createLogger({
  level: config.environment === 'test' ? 'silent' : 'info',
  transports: [
    new transports.Console()
  ],
  format: format.combine(
    format.timestamp(),
    format((info) => {
      info.level = info.level.toUpperCase()
      return info
    })(),
    format.colorize({ colors: { info: 'green', warn: 'yellow', error: 'red' } }),
    format.printf(({ level, message, timestamp }) => `${String(timestamp)} - [ ${level} ]: ${String(message)}`)
  )
})

export default logger
