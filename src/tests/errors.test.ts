/* eslint-disable @typescript-eslint/no-floating-promises */

import assert from 'node:assert'
import { describe, it } from 'node:test'
import { InvalidBodyError } from '../error/errors.js'
import z from 'zod'

describe('testing errors content', () => {
  it('check validation body error', () => {
    const validationResult = z.object({ foo: z.string() }).safeParse({ bar: z.string() })

    assert.ok(validationResult.error)

    const error = new InvalidBodyError('invalid body', validationResult.error.issues)
    const validationErrorFields = { code: 'invalid_type', expected: 'string', received: 'undefined', path: ['foo'], message: 'Required' }

    assert.ok(error.statusCode)
    assert.ok(error.errorCode)
    assert.ok(error.message)
    assert.ok(error.validationError)

    assert.strictEqual(error.statusCode, 400)
    assert.strictEqual(error.errorCode, 'body validation error')
    assert.strictEqual(error.message, 'invalid body')
    assert.strictEqual(Array.isArray(error.validationError), true)

    assert.deepStrictEqual(error.validationError.at(0), validationErrorFields, '>>>>>>>>')
  })
})
