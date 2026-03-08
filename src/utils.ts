import { Request } from 'express'
import { Page } from './types'
import config from './config.js'
import { BooksSource } from './resources/sources/sources.types.js'
import { GoogleBooksVolume } from './resources/sources/google-books/google-books.types.js'
import { OpenLibraryBook } from './resources/sources/open-library/open-library.types.js'
import { apiSources } from './resources/sources/sources.config.js'

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

export async function getBookFromSources (isbn: string): Promise<{ source: BooksSource, fetchedBook: OpenLibraryBook | GoogleBooksVolume }> {
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
      console.log(`error fetching book from ${apiSource.name}`, error)
      // Continue to next source
    }
  }

  if (source == null || fetchedBook == null) {
    throw new Error('Book not found in any source')
  }

  return { source, fetchedBook }
}
