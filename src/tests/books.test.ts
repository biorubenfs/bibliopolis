import { beforeAll, afterAll, describe, it, expect } from 'vitest'
import App from '../app.js'
import testUtils from './utils/utils.js'
import { DataSetType, loadDataInDb, MockDataSet } from '../load-data.js'
import { makeJwt } from '../resources/auth/auth.utils.js'
import { Role } from '../resources/users/users.interfaces.js'

const PORT = testUtils.TESTS_PORTS.BOOKS_PORT
const app = new App(PORT)
const baseUrl = new URL(`http://localhost:${PORT}`)
let token: string
let cookie: string

beforeAll(async () => {
  await app.start()
  await loadDataInDb(DataSetType.Test, MockDataSet.Books, MockDataSet.Users)

  token = makeJwt('01J9BHWZ8N4B1JBSAFCBKQGERS', Role.Regular)
  cookie = testUtils.buildAccessTokenCookie(token)
})

afterAll(async () => {
  await app.stop()
})

describe('books tests', async () => {
  it('should get a book', async () => {
    const url = new URL('/books/01J9KKFT64VX47TEDXMBBFRHTV', baseUrl)
    const response = await fetch(url, { method: 'GET', headers: { cookie } })
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

    const response = await fetch(url, { method: 'GET', headers: { cookie } })
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
}, 15_000)
