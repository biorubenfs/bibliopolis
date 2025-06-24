import { afterAll, beforeAll, describe, it, expect } from 'vitest'
import testUtils from './utils/utils.js'
import { makeJwt } from '../resources/auth/auth.utils.js'
import { Role } from '../resources/users/users.interfaces.js'
import { DataSetType, loadDataInDb, MockDataSet } from '../load-data.js'
import mongo from '../mongo.js'
import librariesDao from '../resources/libraries/libraries.dao.js'

const librariesUrl = new URL('/libraries', testUtils.TESTS_BASE_URL)
const token = makeJwt('01J9BHWZ8N4B1JBSAFCBKQGERS', Role.Regular)
const cookie = testUtils.buildAccessTokenCookie(token)

beforeAll(async () => {
  await loadDataInDb(DataSetType.Test, MockDataSet.Books, MockDataSet.Users, MockDataSet.Libraries, MockDataSet.UserBooks)
  await librariesDao.init()
})

afterAll(async () => {
  await mongo.clean()
})

describe('libraries tests', async () => {
  it('GET /libraries - should list user libraries', async () => {
    const response = await fetch(librariesUrl, {
      headers: {
        cookie,
        'Content-Type': 'application/json'
      },
      method: 'GET'
    })

    const body = await response.json()

    expect(response.status).equals(200)
    expect(body.results.length).equals(2)
  })

  it('GET /libraries?search=first - should list user libraries using search', async () => {
    const url = new URL('/libraries?search=first', testUtils.TESTS_BASE_URL)
    const response = await fetch(url.href, {
      headers: {
        cookie,
        'Content-Type': 'application/json'
      },
      method: 'GET'
    })

    const body = await response.json()

    expect(response.status).equals(200)
    expect(body.results.length).equals(1)
  })

  it('POST /libraries - should create a library', async () => {
    const body = { name: 'new library', description: 'description of the new library' }
    const response = await fetch(librariesUrl, {
      headers: {
        cookie,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(body)
    })

    expect(response.status).equals(201)
  })

  it('POST /libraries - should fail to create a library with existing name', async () => {
    const body = { name: 'sample first library', description: 'description of the sample first library' }
    const response = await fetch(librariesUrl, {
      headers: {
        cookie,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(body)
    })

    expect(response.status).equals(409)
  })

  it('DELETE /libraries/:id - should remove a owned library', async () => {
    const url = new URL('/libraries/01J9W8VR2CFZW8PJ1Q8Y4Y5WEZ', librariesUrl)
    const response = await fetch(url, {
      headers: {
        cookie,
        'Content-Type': 'application/json'
      },
      method: 'DELETE'
    })

    expect(response.status).equals(204)
  })

  it('DELETE /libraries/:id - should fail to remove a non-owned library', async () => {
    const url = new URL('/libraries/01J9XDD1NAFHP0159FYT245D8X', librariesUrl)
    const response = await fetch(url, {
      headers: {
        cookie,
        'Content-Type': 'application/json'
      },
      method: 'DELETE'
    })

    expect(response.status).equals(403)
  })

  it('POST /libraries/:id/books - should add a book to owned library', async () => {
    const url = new URL('/libraries/01J9W8VR2CFZW8PJ1Q8Y4Y5WEX/books', librariesUrl)
    const body = { isbn: '9781595581662' }
    const response = await fetch(url, {
      headers: {
        cookie,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(body)
    })

    const responseBody = await response.json()

    expect(response.status).equals(201)
    const books = responseBody.results.attributes.books
    expect(books).to.be.an('array').includes('01J9KKFWF45DMVVGRS502SG83D')
  })

  it('POST /libraries/:id/books - should fail to add a existing book in a library', async () => {
    const url = new URL('/libraries/01J9W8VR2CFZW8PJ1Q8Y4Y5WEX/books', librariesUrl)
    const body = { isbn: '9781595581662' }
    const response = await fetch(url, {
      headers: {
        cookie,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(body)
    })

    expect(response.status).equals(409)
  })

  it('POST /libraries/:id/books - should fail to add a non existing book to owned library', async () => {
    const url = new URL('/libraries/01J9W8VR2CFZW8PJ1Q8Y4Y5WEX', librariesUrl)
    const body = { id: '01J9KKFWF45DMVVGRS502SFAKE' }
    const response = await fetch(url, {
      headers: {
        cookie,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(body)
    })

    expect(response.status).equals(404)
  })

  it('DELETE /libraries/:id/books - should remove a book from owned library', async () => {
    const url = new URL('/libraries/01J9W8VR2CFZW8PJ1Q8Y4Y5WEX/books', librariesUrl)
    const body = { id: '01J9KKFS6CKTSVY0ETH9A7PHXW' }
    const response = await fetch(url, {
      headers: {
        cookie,
        'Content-Type': 'application/json'
      },
      method: 'DELETE',
      body: JSON.stringify(body)
    })

    expect(response.status).equals(204)
  })

  it.todo('DELETE /libraries/:id/books - should fail to remove a non existing book in a owned library', async () => { })

  it('POST /libraries/:id/books - should fail to add a book in a not owned library', async () => {
    const url = new URL('/libraries/01J9XDD1NAFHP0159FYT245D8X/books', librariesUrl)
    const body = { isbn: '01J9KKFWF45DMVVGRS502SG83D' }
    const response = await fetch(url, {
      headers: {
        cookie,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(body)
    })

    expect(response.status).equals(403)
  })

  it('DELETE /libraries/:id/books - should fail to remove a book in a not owned library', async () => {
    const url = new URL('/libraries/01J9XDD1NAFHP0159FYT245D8X/books', librariesUrl)
    const body = { id: '01J9KKFQRP6H3F30CNT21G1DWT' }
    const response = await fetch(url, {
      headers: {
        cookie,
        'Content-Type': 'application/json'
      },
      method: 'DELETE',
      body: JSON.stringify(body)
    })

    expect(response.status).equals(403)
  })

  it('GET /libraries/:id/books - should list the books of a owned library', async () => {
    const url = new URL('/libraries/01J9W8VR2CFZW8PJ1Q8Y4Y5WEX/books', librariesUrl)
    const response = await fetch(url, {
      headers: {
        cookie,
        'Content-Type': 'application/json'
      },
      method: 'GET'
    })
    const responseBody = await response.json()

    expect(response.status).equals(200)
    expect(responseBody).to.have.property('results')
    expect(responseBody.results).to.be.an('array').of.length(3)
  })

  it('GET /libraries/:id/books - should fail to list books of a not owned library', async () => {
    const url = new URL('/libraries/01J9XDD1NAFHP0159FYT245D8X/books', librariesUrl)
    const response = await fetch(url, {
      headers: {
        cookie,
        'Content-Type': 'application/json'
      },
      method: 'GET'
    })

    expect(response.status).equals(403)
  })
})
