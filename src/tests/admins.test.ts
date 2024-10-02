/* eslint-disable @typescript-eslint/no-floating-promises */

import { after, before, describe, it } from 'node:test'
import App from '../app.js'
import assert from 'node:assert'
import adminsDao from '../resources/admins/admins.dao.js'
import config from '../config.js'

describe('init tests', async () => {
  const PORT = 3001
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

  it('default admins should have been created', async () => {
    const res = await adminsDao.collection.findOne({ name: config.defaultAdmin.name })

    assert.notEqual(res, null)
    assert.equal(res?.name, config.defaultAdmin.name)
  })
})
