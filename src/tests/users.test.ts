/* eslint-disable @typescript-eslint/no-floating-promises */

import { after, before, describe, it } from 'node:test'
import App from '../app.js'
import assert from 'node:assert'
import usersDao from '../resources/users/users.dao.js'
import config from '../config.js'

describe('admins tests', async () => {
  const PORT = 3003
  const app = new App(PORT)

  before(async () => {
    await app.start()
  })

  after(async () => {
    await app.stop()
  })

  it('default user admin should have been created', async () => {
    const res = await usersDao.collection.findOne({ name: config.defaultAdmin.name })

    assert.ok(res)
    assert.strictEqual(res.name, config.defaultAdmin.name)
  })

  it('should create a user', async () => {
    const url = new URL('/users', `http://localhost:${PORT}`)

    const body = {
      name: 'name',
      email: 'email@email.com',
      password: 'password'
    }

    const result = await fetch(url, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(body)
    })

    // const json = await result.json()

    // add more asserts
    assert.equal(result.status, 200)
  })

  it('should fail to create a user', async () => {
    const url = new URL('/users', `http://localhost:${PORT}`)

    const body = {
      name: 'foo',
      email: 'foo@email.com'
    }

    const result = await fetch(url, {
      headers: {
        'Content-Type': 'application/json' // Añadir el header para indicar el tipo de contenido
      },
      method: 'POST',
      body: JSON.stringify(body)
    })

    // add more asserts
    assert.equal(result.status, 400)
  })
})
