import { describe, it, assert, expect } from 'vitest'
import mongo from '../mongo.js'
import testUtils from './utils/utils.js'

describe('init tests', async () => {
  it('healthcheck', async () => {
    const url = new URL('/', testUtils.TESTS_BASE_URL)
    const result = await fetch(url, {
      method: 'GET'
    })

    assert.strictEqual(result.status, 200)
  })

  it('replica set should have been established', async () => {
    // It looks that we have to wait a bit
    await new Promise(resolve => setTimeout(resolve, 500))
    const db = mongo.client.db('admin')
    const admin = db.admin()
    const status = await admin.replSetGetStatus()
    const primary = status.members.filter((m: any) => m.stateStr === 'PRIMARY') as any[]
    const secondary = status.members.filter((m: any) => m.stateStr === 'SECONDARY') as any[]

    expect(primary).to.be.an('array').of.length(1)
    expect(secondary).to.be.an('array').of.length(2)
  })
})
