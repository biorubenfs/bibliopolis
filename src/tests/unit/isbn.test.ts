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
    it('should return false with invalid control digit isbn10', () => {
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

  describe('isbn calculation', () => {
    it('should calculate valid isbn10 from isbn13', () => {
      const isbn13 = '9788415509790'
      const expectedIsbn10 = '8415509790'
      const result = ISBNUtils.calculateIsbns(undefined, isbn13)
      expect(result.isbn10).toBe(expectedIsbn10)
    })
    it('should calculate valid isbn10 from isbn13', () => {
      const isbn13 = '9788415509790'
      const expectedIsbn10 = '8415509790'
      const result = ISBNUtils.isbn13ToIsbn10(isbn13)
      expect(result).toBe(expectedIsbn10)
    })
    it('should calculate valid isbn13 from isbn10', () => {
      const isbn10 = '8415509790'
      const expectedIsbn13 = '9788415509790'
      const result = ISBNUtils.calculateIsbns(isbn10, undefined)
      expect(result.isbn13).toBe(expectedIsbn13)
    })
    it('should calculate valid isbn13 from isbn10', () => {
      const isbn10 = '8415509790'
      const expectedIsbn13 = '9788415509790'
      const result = ISBNUtils.isbn10ToIsbn13(isbn10)
      expect(result).toBe(expectedIsbn13)
    })
    it('should return the same isbns if both provided and valid', () => {
      const isbn10 = '8415509790'
      const isbn13 = '9788415509790'
      const result = ISBNUtils.calculateIsbns(isbn10, isbn13)
      expect(result.isbn10).toBe(isbn10)
      expect(result.isbn13).toBe(isbn13)
    })
  })
})
