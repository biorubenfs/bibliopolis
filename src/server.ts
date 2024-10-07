import express from 'express'
import * as http from 'http'
import usersRouter from './resources/users/users.router.js'
import errorHandler from './error/error-handler.js'
import authRouter from './resources/auth/auth.router.js'
import booksRouter from './resources/books/books.router.js'

export default class Server {
  private readonly express: express.Express
  private readonly port: number
  private httpServer?: http.Server

  constructor (port: number) {
    this.port = port

    this.express = express()
    this.express.use(express.json())

    this.express.get('/', (req, res) => {
      res.json({
        success: true,
        time: new Date().toISOString()
      })
    })

    // add routers here
    this.express.use('/users', usersRouter)
    this.express.use('/auth', authRouter)
    this.express.use('/books', booksRouter)

    // error handling
    this.express.use(errorHandler)
  }

  getHttpServer (): express.Express {
    return this.express
  }

  listen (): void {
    this.httpServer = this.express.listen(this.port, () => console.log(`server listening on port ${this.port}`))
  }

  stop (): void {
    if (this.httpServer != null) {
      this.httpServer.close((err) => {
        if (err != null) {
          console.log('error stopping server', err)
        } else {
          console.log('server stopped succesfully')
        }
      })
    }
  }
}
