import { createLogger, format, transports } from 'winston'

const logger = createLogger({
  transports: [
    new transports.Console()
  ],
  format: format.combine(
    format.timestamp(),
    format.json()
  )
})

export default logger
