import express from 'express'
import * as http from 'http'

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
    // this.express.use('/example', exampleRouter)
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
          console.log('error stopping server')
        } else {
          console.log('server stopped succesfuly')
        }
      })
    }
  }
}
