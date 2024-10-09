/* eslint-disable @typescript-eslint/no-floating-promises */
/* ignore this eslint rule in order to avoid write void before describe and it. Why eslint shows this error? I dont know */

import { expect } from 'chai'
import { describe, it } from 'node:test'

describe('a trivial describe block', () => {
  it('trivial', () => {
    expect(true).equals(true)
  })
})
