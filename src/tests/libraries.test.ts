/* eslint-disable @typescript-eslint/no-floating-promises */

import { after, before, describe, it } from 'node:test'
import App from '../app.js'
import { expect } from 'chai'
import { MockDataSet, loadDataInDb } from './utils/data.js'
import testUtils from './utils/utils.js'
import { makeJwt } from '../resources/auth/auth.utils.js'
import { Role } from '../resources/users/users.interfaces.js'

describe('libraries tests', async () => {
  const PORT = 3005
  const app = new App(PORT)
  const librariesUrl = new URL('/libraries', `http://localhost:${PORT}`)
  const bearerToken = testUtils.buildBearer(makeJwt('01J9BHWZ8N4B1JBSAFCBKQGERS', Role.Regular))

  before(async () => {
    await app.start()

    await loadDataInDb(MockDataSet.Books, MockDataSet.Users, MockDataSet.Libraries, MockDataSet.LibrariesBooks)
  })

  after(async () => {
    await app.stop()
  })

  it('should create a library', async () => {
    const body = { name: 'new library', description: 'description of the new library' }
    const response = await fetch(librariesUrl, {
      headers: {
        Authorization: bearerToken,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(body)
    })

    expect(response.status).equals(200)
  })

  it('should fail to create a library with existing name', async () => {
    const body = { name: 'sample first library', description: 'description of the sample first library' }
    const response = await fetch(librariesUrl, {
      headers: {
        Authorization: bearerToken,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(body)
    })

    expect(response.status).equals(409)
  })

  it('should add a book to owned library', async () => {
    const url = new URL('/libraries/01J9W8VR2CFZW8PJ1Q8Y4Y5WEX/books', librariesUrl)
    const body = { id: '01J9KKFWF45DMVVGRS502SG83D' }
    const response = await fetch(url, {
      headers: {
        Authorization: bearerToken,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(body)
    })

    const responseBody = await response.json()

    expect(response.status).equals(200)
    const books = responseBody.results.attributes.books
    expect(books).to.be.an('array').includes('01J9KKFWF45DMVVGRS502SG83D')
  })

  it('should fail to add a non existing book to owned library', async () => {
    const url = new URL('/libraries/01J9W8VR2CFZW8PJ1Q8Y4Y5WEX', librariesUrl)
    const body = { id: '01J9KKFWF45DMVVGRS502SFAKE' }
    const response = await fetch(url, {
      headers: {
        Authorization: bearerToken,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(body)
    })

    expect(response.status).equals(404)
  })

  it('should remove a book from owned library', async () => {
    const url = new URL('/libraries/01J9W8VR2CFZW8PJ1Q8Y4Y5WEX/books', librariesUrl)
    const body = { id: '01J9KKFS6CKTSVY0ETH9A7PHXW' }
    const response = await fetch(url, {
      headers: {
        Authorization: bearerToken,
        'Content-Type': 'application/json'
      },
      method: 'DELETE',
      body: JSON.stringify(body)
    })

    expect(response.status).equals(200)
  })

  it('should fail to remove a non existing book in a owned library', async () => { })

  it('should fail to add a book in a not owned library', async () => {
    const url = new URL('/libraries/01J9XDD1NAFHP0159FYT245D8X/books', librariesUrl)
    const body = { id: '01J9KKFWF45DMVVGRS502SG83D' }
    const response = await fetch(url, {
      headers: {
        Authorization: bearerToken,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(body)
    })

    expect(response.status).equals(403)
  })

  it('should fail to remove a book in a not owned library', async () => {
    const url = new URL('/libraries/01J9XDD1NAFHP0159FYT245D8X/books', librariesUrl)
    const body = { id: '01J9KKFQRP6H3F30CNT21G1DWT' }
    const response = await fetch(url, {
      headers: {
        Authorization: bearerToken,
        'Content-Type': 'application/json'
      },
      method: 'DELETE',
      body: JSON.stringify(body)
    })

    expect(response.status).equals(403)
  })

  it('should list the books of a owned library', async () => {
    const url = new URL('/libraries/01J9W8VR2CFZW8PJ1Q8Y4Y5WEX/books', librariesUrl)
    const response = await fetch(url, {
      headers: {
        Authorization: bearerToken,
        'Content-Type': 'application/json'
      },
      method: 'GET'
    })

    const responseBody = await response.json()

    expect(response.status).equals(200)
    expect(responseBody).to.have.property('results')
    expect(responseBody.results).to.be.an('array').of.length(3)
  })

  it('should fail to list books of a not owned library', async () => {
    const url = new URL('/libraries/01J9XDD1NAFHP0159FYT245D8X/books', librariesUrl)
    const response = await fetch(url, {
      headers: {
        Authorization: bearerToken,
        'Content-Type': 'application/json'
      },
      method: 'GET'
    })

    expect(response.status).equals(403)
  })
})