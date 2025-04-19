import { afterAll, beforeAll, describe, it, assert, expect } from 'vitest'
import App from '../app.js'
import mongo from '../mongo.js'
import testUtils from './utils/utils.js'

const app = new App(testUtils.TESTS_PORT)

beforeAll(async () => {
  await app.start()
})

afterAll(async () => {
  await app.stop()
})

describe('init tests', async () => {
  it('healthcheck', async () => {
    const url = new URL('/', testUtils.TESTS_BASE_URL)
    const result = await fetch(url, {
      method: 'GET'
    })

    assert.strictEqual(result.status, 200)
  })

  it('replica set should have been established', async () => {
    const db = mongo.client.db('admin')
    const admin = db.admin()
    const status = await admin.replSetGetStatus()
    const primary = status.members.filter((m: any) => m.stateStr === 'PRIMARY') as any[]
    const secondary = status.members.filter((m: any) => m.stateStr === 'SECONDARY') as any[]

    expect(primary).to.be.an('array').of.length(1)
    expect(secondary).to.be.an('array').of.length(2)
  })
})
