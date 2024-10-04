/* eslint-disable @typescript-eslint/no-floating-promises */

import { after, before, describe, it } from 'node:test'
import App from '../app.js'
import assert from 'node:assert'

describe('admins tests', async () => {
    const PORT = 3003
    const app = new App(PORT)

    before(async () => {
        await app.start()
    })

    after(async () => {
        await app.stop()
    })

    it('should create a user', async () => {
        const url = new URL('/users', `http://localhost:${PORT}`)
        
        const body = {
            name: 'foo',
            email: 'foo@email.com',
            password: 'foopswd'
        }

        const result = await fetch(url, {
            body: JSON.stringify(body),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Añadir el header para indicar el tipo de contenido
            }
        })

        const json = await result.json()

        // add more asserts
        assert.equal(result.status, 200)
    })

    it ('should fail to create a user', async () => {
        const url = new URL('/users', `http://localhost:${PORT}`)
        
        const body = {
            name: 'foo',
            email: 'foo@email.com'
        }

        const result = await fetch(url, {
            body: JSON.stringify(body),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Añadir el header para indicar el tipo de contenido
            }
        })

        // add more asserts
        assert.equal(result.status, 400)
    })
})
