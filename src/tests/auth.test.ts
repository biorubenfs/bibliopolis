/* eslint-disable @typescript-eslint/no-floating-promises */

import { after, before, describe, it } from 'node:test'
import App from '../app.js'
import { assert, expect } from 'chai'
import { ApiRestErrorCode } from '../error/types.js'
import testUtils from './utils/utils.js'
import { DataSetType, loadDataInDb, MockDataSet } from '../load-data.js'

describe('login tests', async () => {
  const PORT = testUtils.TESTS_PORTS.AUTH_PORT
  const app = new App(PORT)
  const loginUrl = new URL('/auth', `http://localhost:${PORT}`)

  before(async () => {
    await app.start()

    // load user to be used in login test
    await loadDataInDb(DataSetType.Test, MockDataSet.Users)
  })

  after(async () => {
    await app.stop()
  })

  it('should do login', async () => {
    const response = await fetch(loginUrl, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ email: 'user01@email.com', password: 'Palabra123$' })
    })

    const body = await response.json()

    expect(response.status).equals(200)
    expect(body).to.have.property('results')
    expect(body.results).to.have.property('type')
    expect(body.results).to.have.property('attributes')
    expect(body.results.attributes).to.have.property('token').to.be.a('string')
  })

  it('should fail to do login with wrong password', async () => {
    const response = await fetch(loginUrl, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ email: 'user01@email.com', password: 'Palabra' })
    })

    const body = await response.json()

    assert.strictEqual(response.status, 403)
    expect(body).to.have.property('errorCode').equals(ApiRestErrorCode.InvalidCredentials)
  })

  it('should fail to do login with wrong email', async () => {
    const response = await fetch(loginUrl, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ email: 'user@email.com', password: 'Palabra123$' })
    })

    const body = await response.json()

    assert.strictEqual(response.status, 403)
    expect(body).to.have.property('errorCode').equals(ApiRestErrorCode.InvalidCredentials)
  })

  it('should throw a body validation error', async () => {
    const response = await fetch(loginUrl, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ email: 'user01@mail.com' })
    })

    const body = await response.json()

    expect(response.status).equals(400)
    expect(body).to.have.property('statusCode').equals(400)
    expect(body).to.have.property('errorCode').equals('BODY VALIDATION ERROR')
    expect(body).to.have.property('message').equals('invalid body')
    expect(body).to.have.property('validationError').to.be.an('array').of.length(1)
  })
})
