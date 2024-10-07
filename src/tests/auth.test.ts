/* eslint-disable @typescript-eslint/no-floating-promises */

import { after, before, describe, it } from 'node:test'
import App from '../app.js'
import assert from 'node:assert'
import usersService from '../resources/users/users.service.js'
import authService from '../resources/auth/auth.service.js'
import { InvalidLoginError } from '../resources/auth/auth.error.js'

describe('init tests', async () => {
  const PORT = 3001
  const app = new App(PORT)
  const loginUrl = new URL('/auth', `http://localhost:${PORT}`)

  before(async () => {
    await app.start()

    // load user to be used in login test
    await usersService.create({ name: 'fakeJohn', email: 'fakeJohn@mail.com', password: '1234' })
  })

  after(async () => {
    await app.stop()
  })

  it('should throw a body valition error', async () => {
    const response = await fetch(loginUrl, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ email: 'fakeJohn@mail.com', password: '1234' })
    })

    const body = await response.json()

    assert.strictEqual(response.status, 200)
    assert.ok(body.results)
    assert.ok(body.results.type)
    assert.ok(body.results.attributes)
    assert.ok(body.results.attributes.token)
  })

  it('should do login', async () => {
    const response = await fetch(loginUrl, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ email: 'fakeJohn@mail.com', password: '1234' })
    })

    const body = await response.json()

    assert.strictEqual(response.status, 200)
    assert.ok(body.results)
    assert.ok(body.results.type)
    assert.ok(body.results.attributes)
    assert.ok(body.results.attributes.token)
  })

  it('should fail to do login', async () => {
    const response = await fetch(loginUrl, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ email: 'fakeJohn@mail.com', password: '123' })
    })

    assert.strictEqual(response.status, 403)
  })

  it('should throw an error', async () => {
    try {
      await authService.login({ email: 'foo@email.com', password: '1234' })
      assert.fail('should launch an Invalid Login Error')
    } catch (error) {
      if (error instanceof InvalidLoginError) {
        assert.ok(error.message)
        assert.ok(error.statusCode)
        assert.ok(error.errorCode)
        assert.strictEqual(error.message, 'invalid email or password')
        assert.strictEqual(error.statusCode, 403)
        assert.strictEqual(error.errorCode, 'invalid email or password')
      } else {
        assert.equal(true, false)
      }
    }
  })
})
