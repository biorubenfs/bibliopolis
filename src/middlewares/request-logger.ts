import { NextFunction, Request, Response } from 'express'
import mongo from '../mongo.js'
import { ulid } from 'ulid'
import logger from '../logger.js'

interface _Request {
  ip: string
  method: string
  path: string
  startedAt: Date
  endAt: Date
  time: number
  statusCode: number
}

export function requestLogger (req: Request, res: Response, next: NextFunction): void {
  const start = new Date()

  const { path, method } = req

  const requestId = ulid()

  logger.info(`${requestId} - ${method} ${path}`)

  const collection = mongo.db().collection<_Request>('requests')

  next()

  res.on('finish', () => {
    const end = new Date()

    const { userId, role } = req

    const timeDiffms = end.getTime() - start.getTime()

    const userInfo = userId != null ? `userId: ${userId}${role != null ? `, role: ${role}` : ''}` : 'userId: anonymous'
    logger.info(`${requestId} - ${method} ${path} - ${res.statusCode} - ${timeDiffms}ms - ${userInfo}`)

    void collection.insertOne({
      ip: req.ip ?? '',
      method,
      path,
      startedAt: start,
      endAt: end,
      time: timeDiffms,
      statusCode: res.statusCode
    })
  })
}
