import express from 'express'
import * as http from 'http'
import usersRouter from './resources/users/users.router.js'
import errorHandler from './error/error-handler.js'
import authRouter from './resources/auth/auth.router.js'
import booksRouter from './resources/books/books.router.js'
import librariesRouter from './resources/libraries/libraries.router.js'
import { checkJwt } from './middlewares/jwt.middleware.js'
import logger from './logger.js'
import expressWinston from 'express-winston'
import config from './config.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'

export default class Server {
  private readonly express: express.Express
  private readonly port: number
  private httpServer?: http.Server

  constructor (port: number) {
    this.port = port

    this.express = express()
    this.express.use(express.json())
    this.express.use(cors())
    this.express.use(cookieParser())

    if (config.environment !== 'test') {
      this.express.use(expressWinston.logger({
        winstonInstance: logger,
        statusLevels: true,
        meta: false,
        msg: (req, res) => {
          const { method, path, userId, role } = req
          const { statusCode } = res
          return `${method} ${path}, userId: ${userId ?? 'N/A'}, role: ${role ?? 'N/A'}, status: ${statusCode}}`
        },
        expressFormat: false,
        colorize: false
      }))
    }

    this.express.get('/', (req, res) => {
      res.json({
        success: true,
        time: new Date().toISOString()
      })
    })

    // add routers here
    this.express.use('/auth', authRouter)
    this.express.use('/users', usersRouter)
    this.express.use('/books', booksRouter)
    this.express.use('/libraries', checkJwt, librariesRouter)

    // error handling
    this.express.use(errorHandler)
  }

  getHttpServer (): express.Express {
    return this.express
  }

  listen (): void {
    this.httpServer = this.express.listen(this.port, () => {
      if (config.environment !== 'test') {
        logger.info(`server listening on port ${this.port}`)
      }
    })
  }

  async stop (): Promise<void> {
    return await new Promise((resolve, reject) => {
      if (this.httpServer != null) {
        this.httpServer.close((err) => {
          if (err != null) {
            console.log('Error stopping server', err)
            reject(err)
          } else {
            if (config.environment !== 'test') {
              console.log('Server stopped successfully')
            }
            resolve()
          }
        })
      } else {
        resolve()
      }
    })
  }
}
