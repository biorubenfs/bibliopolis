/* eslint-disable @typescript-eslint/no-floating-promises */
import { after, before, describe, it } from 'node:test'
import { expect } from 'chai'
import App from '../app.js'
import mockDbData, { } from './data.js'

describe('books tests', async () => {
  const PORT = 3004
  const app = new App(PORT)
  const baseUrl = new URL(`http://localhost:${PORT}`)

  before(async () => {
    await app.start()

    await mockDbData.loadBooksInDB()
  })

  after(async () => {
    await app.stop()
  })

  it('should get a book', async () => {
    const url = new URL('/books/01J9KKFT64VX47TEDXMBBFRHTV', baseUrl)
    const response = await fetch(url, { method: 'GET' })
    const body = await response.json()

    expect(response.status).equals(200)
    expect(body).to.have.property('results')
    expect(body.results).to.have.property('type').equals('books')
    expect(body.results).to.have.property('id').equals('01J9KKFT64VX47TEDXMBBFRHTV')
    expect(body.results).to.have.property('attributes')

    const attributes = body.results.attributes
    expect(attributes.title).to.be.a('string').equals('Underground : Life and Survival in the Russian Black Market')
  })

  it('should get a list of books paginated', async () => {
    const url = new URL('/books', baseUrl)
    const skip = 1
    const limit = 8

    url.searchParams.set('skip', skip.toString())
    url.searchParams.set('limit', limit.toString())

    const response = await fetch(url, { method: 'GET' })
    const body = await response.json()

    expect(response.status).equals(200)
    expect(body.results).to.be.an('array').of.length(limit)
    const firstBook = body.results.at(0).attributes
    expect(firstBook).to.have.property('title').equals('My Voice Betrays Me (EEM)')
  })
})
