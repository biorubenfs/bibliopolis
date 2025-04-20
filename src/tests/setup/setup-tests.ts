import fs from 'fs/promises'
import path from 'path'
import { beforeAll } from 'vitest'
import mongo from '../../mongo'

const stateFile = path.resolve('.test-mongo-uri')

beforeAll(async () => {
  const uri = await fs.readFile(stateFile, 'utf-8')
  mongo.setUri(uri) // Use URI from global setup
  await mongo.start({ memory: true }) // Just connect to existing URI
})
