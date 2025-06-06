import { NextFunction, Request, Response } from 'express'
import mongo from '../mongo.js'

interface _Request {
  ip: string
  method: string
  path: string
  startedAt: Date
  endAt: Date
  time: number
  statusCode: number
}

export function logRequest (req: Request, res: Response, next: NextFunction): void {
  const start = new Date()

  const collection = mongo.db().collection<_Request>('requests')

  next()

  res.on('finish', () => {
    const end = new Date()

    const timeDiff = end.getTime() - start.getTime()

    void collection.insertOne({
      ip: req.ip ?? '',
      method: req.method,
      path: req.path,
      startedAt: start,
      endAt: end,
      time: timeDiff,
      statusCode: res.statusCode
    })
  })
}
