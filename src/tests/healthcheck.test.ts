/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { after, before, describe, it } from 'node:test'
import App from '../app.js'
import assert from 'node:assert'

/* Uncomment when mongo memory server is ready
describe('init app', async () => {
  const app = new App()
  before(async () => {
    await app.start()
  })

  after(async () => {
    await app.stop()
  })

  it('healthcheck', async () => {
    const result = await fetch('http://localhost:3000/', {
      method: 'GET'
    })

    assert.strictEqual(result.status, 200)
  })
})
*/
