/* eslint-disable @typescript-eslint/no-floating-promises */

import { after, before, describe, it } from 'node:test'
import App from '../app.js'
import assert from 'node:assert'
import adminsDao from '../resources/admins/admins.dao.js'
import config from '../config.js'

describe('users tests', async () => {
  const PORT = 3001
  const app = new App(PORT)

  before(async () => {
    await app.start()
  })

  after(async () => {
    await app.stop()
  })

  it('default admins should have been created', async () => {
    const res = await adminsDao.collection.findOne({ name: config.defaultAdmin.name })

    assert.notEqual(res, null)
    assert.equal(res?.name, config.defaultAdmin.name)
  })
})
