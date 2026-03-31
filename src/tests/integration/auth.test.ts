import { beforeAll, afterAll, describe, it, expect } from 'vitest'
import { ApiRestErrorCode } from '../../error/types.js'
import testUtils from '../utils/utils.js'
import { DataSetType, loadDataInDb, MockDataSet } from '../../load-data.js'
import mongo from '../../mongo.js'

const loginUrl = new URL('/auth/login', testUtils.TESTS_BASE_URL)
const refreshUrl = new URL('/auth/refresh', testUtils.TESTS_BASE_URL)
const logoutUrl = new URL('/auth/logout', testUtils.TESTS_BASE_URL)
const logoutAllUrl = new URL('/auth/logout-all', testUtils.TESTS_BASE_URL)
const meUrl = new URL('/auth/me', testUtils.TESTS_BASE_URL)

beforeAll(async () => {
  await loadDataInDb(DataSetType.Test, MockDataSet.Books, MockDataSet.Users, MockDataSet.Libraries, MockDataSet.UserBooks)
})

afterAll(async () => {
  await mongo.clean()
})

describe('login tests', () => {
  it('POST /auth/login - should do login and return access token + refresh token cookie', async () => {
    const response = await fetch(loginUrl, {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({ email: 'user01@email.com', password: 'Password123!' })
    })

    const body = await response.json()
    const cookies = response.headers.getSetCookie()
    const refreshTokenCookie = cookies.find(cookie => cookie.startsWith('refresh_token='))

    expect(response.status).toBe(200)

    // Should return access token in body
    expect(body.results).toHaveProperty('type', 'auth')
    expect(body.results).toHaveProperty('attributes')
    expect(body.results.attributes).toHaveProperty('accessToken')
    expect(body.results.attributes.accessToken).toBeTypeOf('string')
    expect(body.results.attributes.accessToken.length).toBeGreaterThan(0)

    // Should set refresh token as httpOnly cookie
    expect(refreshTokenCookie).toBeDefined()
    expect(refreshTokenCookie).toContain('HttpOnly')
    expect(refreshTokenCookie).toContain('Path=/auth')
  })

  it('POST /auth/login - should fail to do login with wrong password', async () => {
    const response = await fetch(loginUrl, {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({ email: 'user01@email.com', password: 'Palabra' })
    })

    const body = await response.json()
    expect(response.status).toBe(403)
    expect(body.errorCode).toBe(ApiRestErrorCode.InvalidCredentials)
  })

  it('POST /auth/login - should fail to do login with wrong email', async () => {
    const response = await fetch(loginUrl, {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({ email: 'user@email.com', password: 'Palabra123$' })
    })

    const body = await response.json()
    expect(response.status).toBe(403)
    expect(body.errorCode).toBe(ApiRestErrorCode.InvalidCredentials)
  })

  it('POST /auth/login - should throw a body validation error', async () => {
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

describe('refresh token tests', () => {
  it('POST /auth/refresh - should get new access token using refresh token', async () => {
    // First login to get refresh token
    const { refreshTokenCookie } = await testUtils.login('user01@email.com', 'Password123!')

    // Use refresh token to get new access token
    const response = await fetch(refreshUrl, {
      method: 'POST',
      headers: {
        Cookie: refreshTokenCookie
      }
    })

    const body = await response.json()
    const cookies = response.headers.getSetCookie()
    const newRefreshTokenCookie = cookies.find(cookie => cookie.startsWith('refresh_token='))

    expect(response.status).toBe(200)

    // Should return new access token
    expect(body.results).toHaveProperty('type', 'auth')
    expect(body.results.attributes).toHaveProperty('accessToken')
    expect(body.results.attributes.accessToken).toBeTypeOf('string')

    // Should rotate refresh token (new cookie)
    expect(newRefreshTokenCookie).toBeDefined()
  })

  it('POST /auth/refresh - should fail without refresh token', async () => {
    const response = await fetch(refreshUrl, {
      method: 'POST'
    })

    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.errorCode).toBe(ApiRestErrorCode.TokenNotProvidedError)
  })

  it('POST /auth/refresh - should fail with invalid refresh token', async () => {
    const response = await fetch(refreshUrl, {
      method: 'POST',
      headers: {
        Cookie: 'refresh_token=invalid-token-here'
      }
    })

    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.errorCode).toBe(ApiRestErrorCode.InvalidTokenError)
  })
})

describe('logout tests', () => {
  it('POST /auth/logout - should revoke refresh token', async () => {
    // Login first
    const { refreshTokenCookie } = await testUtils.login('user01@email.com', 'Password123!')

    // Logout
    const response = await fetch(logoutUrl, {
      method: 'POST',
      headers: {
        Cookie: refreshTokenCookie
      }
    })

    expect(response.status).toBe(204)

    // Try to use the same refresh token (should fail)
    const refreshResponse = await fetch(refreshUrl, {
      method: 'POST',
      headers: {
        Cookie: refreshTokenCookie
      }
    })

    expect(refreshResponse.status).toBe(401) // Token revoked
  })

  it('POST /auth/logout-all - should revoke all refresh tokens for user', async () => {
    // Login twice from different "devices"
    const device1 = await testUtils.login('user01@email.com', 'Password123!')
    const device2 = await testUtils.login('user01@email.com', 'Password123!')

    // Logout from all devices
    const response = await fetch(logoutAllUrl, {
      method: 'POST',
      headers: {
        Authorization: testUtils.buildAuthorizationHeader(device1.accessToken),
        Cookie: device1.refreshTokenCookie
      }
    })

    expect(response.status).toBe(204)

    // Try to refresh from both devices (both should fail)
    const refresh1 = await fetch(refreshUrl, {
      method: 'POST',
      headers: { Cookie: device1.refreshTokenCookie }
    })

    const refresh2 = await fetch(refreshUrl, {
      method: 'POST',
      headers: { Cookie: device2.refreshTokenCookie }
    })

    expect(refresh1.status).toBe(401) // Token revoked
    expect(refresh2.status).toBe(401) // Token revoked
  })
})

describe('me endpoint tests', () => {
  it('GET /auth/me - should get user info with valid access token', async () => {
    const { accessToken } = await testUtils.login('user01@email.com', 'Password123!')

    const response = await fetch(meUrl, {
      method: 'GET',
      headers: {
        Authorization: testUtils.buildAuthorizationHeader(accessToken)
      }
    })

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.results).toHaveProperty('type', 'users')
    expect(body.results).toHaveProperty('id', '01J9BHWZ8N4B1JBSAFCBKQGERS')
    expect(body.results.attributes).toHaveProperty('email', 'user01@email.com')
  })

  it('GET /auth/me - should fail without token', async () => {
    const response = await fetch(meUrl, {
      method: 'GET'
    })

    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.errorCode).toBe(ApiRestErrorCode.TokenNotProvidedError)
  })

  it('GET /auth/me - should fail with invalid token', async () => {
    const response = await fetch(meUrl, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer invalid-token'
      }
    })

    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.errorCode).toBe(ApiRestErrorCode.InvalidTokenError)
  })
})
