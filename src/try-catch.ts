import { Request, Response, NextFunction } from 'express'
import { CollectionResultObject, SingleResultObject, MiscResultObject } from './results.js'
import { Entity, EntityType } from './entity.js'
import { HttpStatusCode } from './types.js'

type StatusCustomController = HttpStatusCode
type DataCustomController = SingleResultObject<Entity<EntityType>> | CollectionResultObject<Entity<EntityType>> | MiscResultObject | null

type CustomController = (req: Request) => Promise<{ status: StatusCustomController, data: DataCustomController }>

function sendResponse (res: Response, status: number, data: any): void {
  res.status(status).json(data)
}

function tryCatch (controller: CustomController) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const resultObject = await controller(req)

      switch (true) {
        case resultObject.data instanceof CollectionResultObject:
          sendResponse(res, resultObject.status, {
            results: resultObject.data.entities.map(r => r.toResult()),
            paginationInfo: resultObject.data.paginationInfo
          })
          return

        case resultObject.data instanceof SingleResultObject:
          sendResponse(res, resultObject.status, { results: resultObject.data.entity.toResult() })
          return

        case resultObject.data instanceof MiscResultObject:
          sendResponse(res, resultObject.status, { results: resultObject.data.toResult() })
          return

        case resultObject.data == null:
          res.sendStatus(resultObject.status)
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
