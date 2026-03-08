import { describe, expect, it } from 'vitest'
import { ISBNUtils } from '../utils/isbn.utils'

describe('isbn tests', () => {
  describe('isbn13 validation', () => {
    it('should return true with valid isbn13', () => {
      const validIsbn13 = '9781718500402'
      const result = ISBNUtils.isValidIsbn13(validIsbn13)
      expect(result).toBe(true)
    })
    it('should return true with valid isbn13 with dashes', () => {
      const validIsbn13 = '978-1-71850-040-2'
      const result = ISBNUtils.isValidIsbn13(validIsbn13)
      expect(result).toBe(true)
    })
    it('should return false with invalid control digit isbn13', () => {
      const validIsbn13 = '9781718500403'
      const result = ISBNUtils.isValidIsbn13(validIsbn13)
      expect(result).toBe(false)
    })
    it('should return false with invalid core digit isbn13', () => {
      const validIsbn13 = '9781718500412'
      const result = ISBNUtils.isValidIsbn13(validIsbn13)
      expect(result).toBe(false)
    })
    it('should return false with invalid prefix digit isbn13', () => {
      const validIsbn13 = '945-1-71850-040-2'
      const result = ISBNUtils.isValidIsbn13(validIsbn13)
      expect(result).toBe(false)
    })
    it('should return false with invalid characters isbn13', () => {
      const validIsbn13 = '978171%500402'
      const result = ISBNUtils.isValidIsbn13(validIsbn13)
      expect(result).toBe(false)
    })
  })

  describe('isbn10 validation', () => {
    it.todo('should return true with valid isbn10', () => {})
    it.todo('should return true with valid isbn10 with dashes', () => {})
    it.todo('should return false with invalid isbn10', () => {})
    it.todo('should return false with invalid core digit isbn10', () => {})
    it.todo('should return false with invalid prefix digit isbn10', () => {})
    it.todo('should return false with invalid characters isbn10', () => {})
  })
})
