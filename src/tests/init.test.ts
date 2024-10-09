/* eslint-disable @typescript-eslint/no-floating-promises */

import { after, before, describe, it } from 'node:test'
import App from '../app.js'
import { assert, expect } from 'chai'
import mongo from '../mongo.js'

describe('init tests', async () => {
  const PORT = 3002
  const app = new App(PORT)

  before(async () => {
    await app.start()
  })

  after(async () => {
    await app.stop()
  })

  it('healthcheck', async () => {
    const url = new URL('/', `http://localhost:${PORT}`)
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
