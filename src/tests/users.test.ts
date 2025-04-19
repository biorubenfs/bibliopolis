import { afterAll, beforeAll, describe, it, expect } from 'vitest'
import usersDao from '../resources/users/users.dao.js'
import config from '../config.js'
import { Role } from '../resources/users/users.interfaces.js'
import { makeJwt } from '../resources/auth/auth.utils.js'
import testUtils from './utils/utils.js'
import { DataSetType, loadDataInDb, MockDataSet } from '../load-data.js'
import mongo from '../mongo.js'

const usersURL = new URL('/users', testUtils.TESTS_BASE_URL)

const token = makeJwt('01J9BHWZ8N4B1JBSAFCBKQGERS', Role.Regular)
const cookie = testUtils.buildAccessTokenCookie(token)

beforeAll(async () => {
  await loadDataInDb(DataSetType.Test, MockDataSet.Books, MockDataSet.Users, MockDataSet.Libraries, MockDataSet.UserBooks)
})

afterAll(async () => {
  await mongo.clean()
})

describe('users tests', async () => {
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
    expect(response.status).equals(201)
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

  it('should deny to create a new user', async () => {
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

  it('should get a user', async () => {
    const usersMeUrl = new URL('/users/me', usersURL)
    const response = await fetch(usersMeUrl, {
      headers: {
        cookie
      },
      method: 'GET'
    })

    expect(response.status).equals(200)
  })
})
