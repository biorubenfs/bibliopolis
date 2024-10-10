/* eslint-disable @typescript-eslint/no-floating-promises */

import { after, before, describe, it } from 'node:test'
import App from '../app.js'
import { expect } from 'chai'
import usersDao from '../resources/users/users.dao.js'
import config from '../config.js'
import mockDbData from './utils/data.js'

describe('users tests', async () => {
  const PORT = 3003
  const app = new App(PORT)
  const usersURL = new URL('/users', `http://localhost:${PORT}`)

  before(async () => {
    await app.start()

    await mockDbData.loadUsersInDB()
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

  it('should return a validation body error', async () => {
    const body = {
      name: 'foo',
      email: 'foo@email.com'
    }

    const response = await fetch(usersURL, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(body)
    })

    expect(response.status).equals(400)
  })

  it('should denied to create a new user', async () => {
    const body = {
      name: 'user01',
      email: 'user01@email.com',
      password: 'Palabra123$'
    }

    const response = await fetch(usersURL, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(body)
    })

    expect(response.status).equals(409)
  })
})
