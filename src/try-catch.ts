import { Request, Response, NextFunction } from 'express'
import { CollectionResultObject, SingleResultObject, MiscResultObject } from './results.js'
import { Entity, EntityType } from './entity.js'
import { HttpStatusCode } from './types.js'

type StatusCustomController = HttpStatusCode
type DataCustomController = SingleResultObject<Entity<EntityType>> | CollectionResultObject<Entity<EntityType>> | MiscResultObject

type CustomController = (req: Request) => Promise<{ status: StatusCustomController, data: DataCustomController | null } >

function tryCatch (controller: CustomController) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const resultObject = await controller(req)
      if (resultObject.data instanceof CollectionResultObject) {
        res.status(resultObject.status).json({
          results: resultObject.data.entities.map(r => r.toResult()),
          paginationInfo: resultObject.data.paginationInfo
        })
      }
      if (resultObject.data instanceof SingleResultObject) {
        res.status(resultObject.status).json({ results: resultObject.data.entity.toResult() })
      }
      if (resultObject.data instanceof MiscResultObject) {
        res.status(resultObject.status).json({ results: resultObject.data.toResult() })
      }
      if (resultObject.data == null) {
        res.sendStatus(resultObject.status)
      }

      res.sendStatus(200)
    } catch (error) {
      next(error)
    }
  }
}

export default tryCatch
