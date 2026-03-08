import { Request } from 'express'
import { BookCover, Page } from './types.js'
import config from './config.js'
import { BooksSource } from './resources/sources/sources.types.js'
import { GoogleBooksVolume } from './resources/sources/google-books/google-books.types.js'
import { OpenLibraryBook } from './resources/sources/open-library/open-library.types.js'
import { apiSources } from './resources/sources/sources.config.js'
import logger from './logger.js'

export enum CoverSize {
  S = 'S',
  M = 'M',
  L = 'L'
}

export function isNotNull<T> (value: T | null): value is T {
  return value !== null
}

/* At this point we know that skip and limit query params are strings parseable to
number without errors because this function should be applied after query params middleware */
export function parseSkipLimitQP (req: Request): Page {
  const { skip, limit } = req.query
  if (typeof skip !== 'string' || typeof limit !== 'string') {
    throw new Error('should not happen')
  }
  return { skip: parseInt(skip), limit: parseInt(limit) }
}

interface CoverConfig {
  pattern: string
  defaultSize: string
  sizeValues: readonly string[]
}

const coverConfigs: Record<BooksSource, CoverConfig> = {
  [BooksSource.OPEN_LIBRARY]: {
    pattern: config.openLibrary.coverUrlPattern,
    defaultSize: CoverSize.M,
    sizeValues: [CoverSize.S, CoverSize.M, CoverSize.L]
  },
  [BooksSource.GOOGLE_BOOKS]: {
    pattern: config.googleBooks.coverUrlPattern,
    defaultSize: '1',
    sizeValues: ['0', '1', '2', '3', '4', '5']
  }
}

export function getCoverUrl (source: BooksSource | null, coverId: string | null, size?: any): string | null {
  if (coverId == null || source == null) return null
  const cfg = coverConfigs[source]

  if (!cfg.sizeValues.includes(size)) {
    size = cfg.defaultSize
  }

  return cfg.pattern
    .replace(':id', coverId.toString())
    .replace(':size', size ?? cfg.defaultSize)
}

export function ensureArray (value: string | string[] | undefined | null): string[] | null {
  if (value == null) {
    return []
  }
  return Array.isArray(value) ? value : [value]
}

export function transformImageToBase64 (imageDate: ArrayBuffer): string {
  const buffer = Buffer.from(imageDate)
  return buffer.toString('base64')
}

export function neverReached (param: never): never {
  throw new Error(`Unhandled case: ${String(param)}`)
}

function hasCover (source: BooksSource, book: OpenLibraryBook | GoogleBooksVolume): boolean {
  switch (source) {
    case BooksSource.OPEN_LIBRARY: {
      const openLibraryBook = book as OpenLibraryBook
      return openLibraryBook.covers != null && openLibraryBook.covers.length > 0 && openLibraryBook.covers[0] != null
    }
    case BooksSource.GOOGLE_BOOKS: {
      const googleBooksVolume = book as GoogleBooksVolume
      return googleBooksVolume.volumeInfo.imageLinks != null
    }
  }
}

async function getCoverFromSources (isbn: string, excludeSource?: BooksSource): Promise<{ source: BooksSource, cover: BookCover } | null> {
  for (const apiSource of apiSources) {
    // Skip the source where we already got the book
    if (excludeSource != null && apiSource.name === excludeSource) {
      continue
    }

    try {
      const result = await apiSource.fetch(isbn)
      if (result != null && hasCover(apiSource.name, result)) {
        // Extract cover information based on source type
        let coverValue: string | null = null

        switch (apiSource.name) {
          case BooksSource.OPEN_LIBRARY: {
            const openLibraryBook = result as OpenLibraryBook
            coverValue = openLibraryBook.covers?.at(0)?.toString() ?? null
            break
          }
          case BooksSource.GOOGLE_BOOKS: {
            const googleBooksVolume = result as GoogleBooksVolume
            coverValue = googleBooksVolume.id
            break
          }
        }

        if (coverValue != null) {
          return {
            source: apiSource.name,
            cover: {
              source: apiSource.name,
              value: coverValue
            }
          }
        }
      }
    } catch (error) {
      logger.error(`error fetching cover from ${apiSource.name}`, error)
      // Continue to next source
    }
  }

  return null
}

export async function getBookFromSources (isbn: string): Promise<{ source: BooksSource, fetchedBook: OpenLibraryBook | GoogleBooksVolume, cover?: BookCover }> {
  let source: BooksSource | null = null
  let fetchedBook: OpenLibraryBook | GoogleBooksVolume | null = null

  // Try each source in priority order until we find a result
  for (const apiSource of apiSources) {
    try {
      const result = await apiSource.fetch(isbn)
      if (result != null) {
        source = apiSource.name
        fetchedBook = result
        break // Stop searching once we find a result
      }
    } catch (error) {
      logger.error(`error fetching book from ${apiSource.name}`, error)
      // Continue to next source
    }
  }

  if (source == null || fetchedBook == null) {
    throw new Error('Book not found in any source')
  }

  // Check if the book has a cover
  if (!hasCover(source, fetchedBook)) {
    const coverFromOtherSource = await getCoverFromSources(isbn, source)

    if (coverFromOtherSource != null) {
      return { source, fetchedBook, cover: coverFromOtherSource.cover }
    }
  }

  return { source, fetchedBook }
}
