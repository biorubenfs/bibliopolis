/* eslint-disable @typescript-eslint/no-floating-promises */
import { expect } from 'chai'
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

    expect(error).to.have.property('statusCode').equals(400)
    expect(error).to.have.property('errorCode').equals('BODY VALIDATION ERROR')
    expect(error).to.have.property('message').equals('invalid body')
    expect(error).to.have.property('validationError').to.be.an('array')
    expect(error.validationError?.at(0)).deep.equals(validationErrorFields)
  })
})
