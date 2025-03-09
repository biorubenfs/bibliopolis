/* eslint-disable @typescript-eslint/no-floating-promises */
import { after, before, describe, it } from 'node:test'
import { expect } from 'chai'
import App from '../app.js'
import testUtils from './utils/utils.js'
import { DataSetType, loadDataInDb, MockDataSet } from '../load-data.js'

describe('books tests', async () => {
  const PORT = testUtils.TESTS_PORTS.BOOKS_PORT
  const app = new App(PORT)
  const baseUrl = new URL(`http://localhost:${PORT}`)
  const loginUrl = new URL('/auth', baseUrl)
  let token: string

  before(async () => {
    await app.start()

    /* load data into database */
    await loadDataInDb(DataSetType.Test, MockDataSet.Books, MockDataSet.Users)

    token = await testUtils.getUserToken(loginUrl, 'user01@email.com', 'Palabra123$')
  })

  after(async () => {
    await app.stop()
  })

  it('should get a book', async () => {
    const url = new URL('/books/01J9KKFT64VX47TEDXMBBFRHTV', baseUrl)
    const response = await fetch(url, { method: 'GET', headers: { Authorization: `Bearer ${token}` } })
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

    /* setting pagination query params */
    url.searchParams.set('skip', skip.toString())
    url.searchParams.set('limit', limit.toString())

    const response = await fetch(url, { method: 'GET', headers: { Authorization: `Bearer ${token}` } })
    const body = await response.json()

    expect(response.status).equals(200)
    expect(body.results).to.be.an('array').of.length(limit)
    expect(body).to.have.property('paginationInfo')
    expect(body.paginationInfo.limit).to.be.a('number').equals(limit)
    expect(body.paginationInfo.skip).to.be.a('number').equals(skip)
    expect(body.paginationInfo.total).to.be.a('number').equals(12)

    const firstBook = body.results.at(0).attributes
    expect(firstBook).to.have.property('title').equals('My Voice Betrays Me (EEM)')
  })
})
