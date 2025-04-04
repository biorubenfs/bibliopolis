import { Request, Response, NextFunction } from 'express'
import { CollectionResultObject, SingleResultObject, MiscResultObject, SetCookieResultObject, ClearCookieResultObject } from './results.js'
import { Entity, EntityType } from './entity.js'
import { HttpStatusCode } from './types.js'

type StatusCustomController = HttpStatusCode
type DataCustomController = SingleResultObject<Entity<EntityType>> | CollectionResultObject<Entity<EntityType>> | MiscResultObject<Entity<EntityType>> | SetCookieResultObject<Entity<EntityType>> | ClearCookieResultObject | null

type CustomController = (req: Request) => Promise<{ status: StatusCustomController, data: DataCustomController }>

function tryCatch (controller: CustomController) {
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
          const { name, value, options } = data.cookie
          res.cookie(name, value, options)
            .status(status)
            .json(data.entity.toResult())
          return

        case data instanceof SetCookieResultObject:
          res.cookie(data.name, data.value, data.options)
            .status(status)
            .json(data.entity.toResult())
          return

        case data instanceof ClearCookieResultObject:
          res.clearCookie(data.name, data.options)
            .status(status)
          return

        case data == null:
          res.status(status)
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
