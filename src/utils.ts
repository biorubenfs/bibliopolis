import { Request } from 'express'

export function isNotNull<T> (value: T | null): value is T {
  return value !== null
}

/* At this point we know that skip and limit query params are strings parseable to
number without errors because this function should be applied after query params middleware */
export function parseSkipLimitQP (req: Request): [number, number] {
  const { skip, limit } = req.query
  if (typeof skip !== 'string' || typeof limit !== 'string') {
    throw new Error('should not happen')
  }
  return [parseInt(skip), parseInt(limit)]
}
