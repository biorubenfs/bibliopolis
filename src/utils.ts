import { Request } from 'express'
import { Page } from './types'
import config from './config.js'

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

export function getCoverUrl (coverId: string | null): string | null {
  if (coverId == null) return null

  const coverUrl = config.openLibrary.coverUrlPattern.replace(':id', coverId)
  return coverUrl
}
