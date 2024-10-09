/* eslint-disable @typescript-eslint/no-floating-promises */

import { after, before, describe, it } from 'node:test'

import App from '../app.js'
import assert from 'node:assert'
import fs from 'fs'
import path from 'path/posix'
import booksDao from '../resources/books/books.dao.js'

describe('books tests', async () => {
  const PORT = 3004
  const app = new App(PORT)
  const baseUrl = new URL(`http://localhost:${PORT}`)

  before(async () => {
    await app.start()

    const dirPath = new URL(path.join('../../data/test-mock-data'), import.meta.url)
    const filePath = path.join(dirPath.pathname, 'books.json')
    console.log('>>>>>', filePath)
    const file = fs.readFileSync(filePath, 'utf8')

    await booksDao.collection.insertMany(JSON.parse(file))
  })

  after(async () => {
    await app.stop()
  })

  it('should get a book', async () => {
    const url = new URL('/books/01J9KKFT64VX47TEDXMBBFRHTV', baseUrl)
    const response = await fetch(url, { method: 'GET' })
    const json = await response.json()

    assert.strictEqual(response.status, 200)
    assert.ok(json.results)
    assert.strictEqual(json.results.type, 'books')
    assert.strictEqual(json.results.id, '01J9KKFT64VX47TEDXMBBFRHTV')
    assert.ok(json.results.attributes)

    const attributes = json.results.attributes
    assert.strictEqual(attributes.title, 'Underground : Life and Survival in the Russian Black Market')
  })
})
