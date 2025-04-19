import { beforeAll, afterAll, describe, it, expect } from 'vitest'
import { ApiRestErrorCode } from '../error/types.js'
import testUtils, { } from './utils/utils.js'
import { DataSetType, loadDataInDb, MockDataSet } from '../load-data.js'
import mongo from '../mongo.js'

// const app = new App(testUtils.TESTS_PORT)
const loginUrl = new URL('/auth/login', testUtils.TESTS_BASE_URL)

beforeAll(async () => {
  await loadDataInDb(DataSetType.Test, MockDataSet.Books, MockDataSet.Users, MockDataSet.Libraries, MockDataSet.UserBooks)
})

afterAll(async () => {
  await mongo.clean()
})

describe('login tests', () => {
  it('should do login', async () => {
    const response = await fetch(loginUrl, {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({ email: 'user01@email.com', password: 'Palabra123$' })
    })

    const cookies = response.headers.getSetCookie()
    const accessToken = cookies.find(cookie => cookie.startsWith('access_token'))
    expect(accessToken).toBeDefined()

    const body = await response.json()

    expect(response.status).toBe(200)

    expect(body).toHaveProperty('id')
    expect(body).property('id').equals('01J9BHWZ8N4B1JBSAFCBKQGERS')
  })

  it('should fail to do login with wrong password', async () => {
    const response = await fetch(loginUrl, {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({ email: 'user01@email.com', password: 'Palabra' })
    })

    const body = await response.json()
    expect(response.status).toBe(403)
    expect(body.errorCode).toBe(ApiRestErrorCode.InvalidCredentials)
  })

  it('should fail to do login with wrong email', async () => {
    const response = await fetch(loginUrl, {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({ email: 'user@email.com', password: 'Palabra123$' })
    })

    const body = await response.json()
    expect(response.status).toBe(403)
    expect(body.errorCode).toBe(ApiRestErrorCode.InvalidCredentials)
  })

  it('should throw a body validation error', async () => {
    const response = await fetch(loginUrl, {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({ email: 'user01@email.com' }) // falta password
    })

    const body = await response.json()
    expect(response.status).toBe(400)
    expect(body.message).toBe('invalid body')
    expect(body.validationError).toBeInstanceOf(Array)
    expect(body.validationError.length).toBe(1)
  })
})
