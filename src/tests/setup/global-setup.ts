import fs from 'fs/promises'
import path from 'path'
import Server from '../../server.js'
import mongo from '../../mongo.js'

const stateFile = path.resolve('.test-mongo-uri')
let server: Server

export async function setup (): Promise<void> {
  await mongo.start({ memory: true })

  // save uri to use in tests
  await fs.writeFile(stateFile, mongo.uri)

  server = new Server(3001)
  server.listen()
}

export async function teardown (): Promise<void> {
  await server.stop()
  await mongo.stop()
  await fs.rm(stateFile)
}
