import { afterAll, beforeAll, describe, it, expect } from 'vitest'
import usersDao from '../resources/users/users.dao.js'
import config from '../config.js'
import { Role } from '../resources/users/users.interfaces.js'
import { makeJwt } from '../resources/auth/auth.utils.js'
import testUtils from './utils/utils.js'
import { DataSetType, loadDataInDb, MockDataSet } from '../load-data.js'
import mongo from '../mongo.js'
import bcrypt from 'bcryptjs'

const usersURL = new URL('/users', testUtils.TESTS_BASE_URL)

const token = makeJwt('01J9BHWZ8N4B1JBSAFCBKQGERS', Role.Regular)
const cookie = testUtils.buildAccessTokenCookie(token)

beforeAll(async () => {
  await loadDataInDb(DataSetType.Test, MockDataSet.Books, MockDataSet.Users, MockDataSet.Libraries, MockDataSet.UserBooks)
  await usersDao.init()
})

afterAll(async () => {
  await mongo.clean()
})

describe('users tests', async () => {
  it('default user admin should have been created', async () => {
    const response = await usersDao.collection.findOne(
      {
        name: config.defaultAdmin.name,
        role: Role.Admin
      })

    expect(response).to.be.not.equals(null)
    expect(response).to.have.property('name').equals(config.defaultAdmin.name)
  })

  it('POST /users - should create a user', async () => {
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
    expect(response.status).equals(201)
  })

  it('POST /users - should return a validation body error', async () => {
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

  it('POST /users - should deny to create a new user', async () => {
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

  it('GET /users -  /users should get a user', async () => {
    const usersMeUrl = new URL('/users/me', usersURL)
    const response = await fetch(usersMeUrl, {
      headers: {
        cookie
      },
      method: 'GET'
    })

    expect(response.status).equals(200)
  })

  it('PATCH /users/me/password - should update user password', async () => {
    // For some reason, update password tests don't work
    const updatePasswordUrl = new URL('/users/me/password', usersURL)

    const hash = bcrypt.hashSync('Password123!', '$2b$10$abcdefghijklmnopqrstuu')
    console.log(hash)

    const body = {
      currentPassword: 'Password123!',
      newPassword: 'Password123$'
    }

    console.log(await usersDao.findById('01J9BHWZ8N4B1JBSAFCBKQGERS'))

    const response = await fetch(updatePasswordUrl, {
      headers: {
        cookie
      },
      method: 'PATCH',
      body: JSON.stringify(body)
    })

    expect(response.status).equals(204)
  })

  it.todo('PATCH /users/me/password - should fail update user password with wrong current password')
})
