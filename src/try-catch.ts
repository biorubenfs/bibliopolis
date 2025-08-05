import { Request, Response, NextFunction, RequestHandler } from 'express'
import { CollectionResultObject, SingleResultObject, MiscResultObject, SetCookieResultObject, ClearCookieResultObject, RedirectResultObject } from './results.js'
import { Entity, EntityType } from './entity.js'
import { HttpStatusCode } from './types.js'

type StatusCustomController = HttpStatusCode
type DataCustomController =
  SingleResultObject<Entity<EntityType>> |
  CollectionResultObject<Entity<EntityType>> |
  MiscResultObject |
  SetCookieResultObject<Entity<EntityType>> |
  ClearCookieResultObject |
  RedirectResultObject |
  null

type CustomController<TBody> = (req: Request<any, any, TBody>) => Promise<{ status: StatusCustomController, data: DataCustomController }>

function tryCatch<TBody> (controller: CustomController<TBody>): RequestHandler<any, any, TBody> {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const { status, data } = await controller(req)

      switch (true) {
        case data instanceof CollectionResultObject:
          res.status(status)
            .json({
              results: data.entities.map(entity => entity.toResult()),
              paginationInfo: data.paginationInfo
            })
          return

        case data instanceof SingleResultObject:
          res.status(status)
            .json({ results: data.entity.toResult() })
          return

        case data instanceof MiscResultObject:
          res.status(status)
            .json({ results: data.toResult() })
          return

        case data instanceof SetCookieResultObject:
          res.cookie(data.name, data.value, data.options)
            .status(status)
            .json({ results: data.entity.toResult() })
          return

        case data instanceof ClearCookieResultObject:
          res.clearCookie(data.name, data.options)
            .sendStatus(status)
          return

        case data instanceof RedirectResultObject:
          res.redirect(status, data.url.href)
          return

        case data == null:
          res.sendStatus(status)
          return

        default:
          /* maybe we should throw and error or log something, although all cases are covered */
          res.sendStatus(200)
      }
    } catch (error) {
      next(error)
    }
  }
}

export default tryCatch
