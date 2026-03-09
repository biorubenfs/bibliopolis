import { describe, expect, it } from 'vitest'
import { ISBNUtils } from '../../utils/isbn.utils.js'

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
    it('should return false with invalid length isbn13', () => {
      const validIsbn13 = '978171850040'
      const result = ISBNUtils.isValidIsbn13(validIsbn13)
      expect(result).toBe(false)
    })
  })

  describe('isbn10 validation', () => {
    it('should return true with valid isbn10', () => {
      const validIsbn10 = '8483835045'
      const result = ISBNUtils.isValidIsbn10(validIsbn10)
      expect(result).toBe(true)
    })
    it('should return true with valid isbn10 with dashes', () => {
      const validIsbn10 = '84-8383-504-5'
      const result = ISBNUtils.isValidIsbn10(validIsbn10)
      expect(result).toBe(true)
    })
    it('should return false with invalid  control digitisbn10', () => {
      const validIsbn10 = '8483835044'
      const result = ISBNUtils.isValidIsbn10(validIsbn10)
      expect(result).toBe(false)
    })
    it('should return false with invalid core digit isbn10', () => {
      const validIsbn10 = '8483836045'
      const result = ISBNUtils.isValidIsbn10(validIsbn10)
      expect(result).toBe(false)
    })
    it('should return false with invalid prefix digit isbn10', () => {
      const validIsbn10 = '1483835045'
      const result = ISBNUtils.isValidIsbn10(validIsbn10)
      expect(result).toBe(false)
    })
    it('should return false with invalid characters isbn10', () => {
      const validIsbn10 = '8483835%45'
      const result = ISBNUtils.isValidIsbn10(validIsbn10)
      expect(result).toBe(false)
    })
    it('should return false with invalid length isbn10', () => {
      const validIsbn10 = '848383504'
      const result = ISBNUtils.isValidIsbn10(validIsbn10)
      expect(result).toBe(false)
    })
  })
})
