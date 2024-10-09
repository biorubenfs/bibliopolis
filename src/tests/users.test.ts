/* eslint-disable @typescript-eslint/no-floating-promises */

import { after, before, describe, it } from 'node:test'
import App from '../app.js'
import { expect } from 'chai'
import usersDao from '../resources/users/users.dao.js'
import config from '../config.js'

describe('admins tests', async () => {
  const PORT = 3003
  const app = new App(PORT)
  const usersURL = new URL('/users', `http://localhost:${PORT}`)

  before(async () => {
    await app.start()
  })

  after(async () => {
    await app.stop()
  })

  it('default user admin should have been created', async () => {
    const response = await usersDao.collection.findOne({ name: config.defaultAdmin.name })

    expect(response).to.be.not.equals(null)
    expect(response).to.have.property('name').equals(config.defaultAdmin.name)
  })

  it('should create a user', async () => {
    const body = {
      name: 'name',
      email: 'email@email.com',
      password: 'password'
    }

    const response = await fetch(usersURL, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(body)
    })

    // add more asserts
    expect(response.status).equals(200)
  })

  it('should fail to create a user', async () => {
    const body = {
      name: 'foo',
      email: 'foo@email.com'
    }

    const response = await fetch(usersURL, {
      headers: {
        'Content-Type': 'application/json' // Añadir el header para indicar el tipo de contenido
      },
      method: 'POST',
      body: JSON.stringify(body)
    })

    // add more asserts
    expect(response.status).equals(400)
  })
})
